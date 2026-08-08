using Microsoft.EntityFrameworkCore;
using LiFeDenTal.Data;
using LiFeDenTal.DTOs;

namespace LiFeDenTal.Services;

public class AvailabilityService
{
    private readonly LiFeDenTalDbContext _db;

    private static readonly TimeOnly ClinicStart = new(8, 0);
    private static readonly TimeOnly LunchStart = new(11, 0);
    private static readonly TimeOnly LunchEnd = new(12, 0);
    private static readonly TimeOnly ClinicEnd = new(17, 0);
    private static readonly int SlotMinutes = 45;

    public AvailabilityService(LiFeDenTalDbContext db)
    {
        _db = db;
    }

    public async Task<DentistAvailabilityResponse?> GetDentistAvailabilityAsync(int dentistId, DateOnly date)
    {
        // Blockera helger
        var dayOfWeek = date.DayOfWeek;
        if (dayOfWeek == DayOfWeek.Saturday || dayOfWeek == DayOfWeek.Sunday)
            return null;

        var dentist = await _db.Dentists
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == dentistId);

        if (dentist is null) return null;

        var dayStart = date.ToDateTime(ClinicStart);
        var dayEnd = date.ToDateTime(ClinicEnd);

        var bookedSlots = await _db.Appointments
            .Where(a =>
                a.DentistId == dentistId &&
                a.Status != Models.AppointmentStatus.Cancelled &&
                a.StartTime < dayEnd &&
                a.EndTime > dayStart)
            .Select(a => new { a.StartTime, a.EndTime })
            .ToListAsync();

        var slots = new List<TimeSlot>();
        var current = date.ToDateTime(ClinicStart);

        while (current.AddMinutes(SlotMinutes) <= date.ToDateTime(ClinicEnd))
        {
            var slotEnd = current.AddMinutes(SlotMinutes);
            var slotStartTime = TimeOnly.FromDateTime(current);
            var slotEndTime = TimeOnly.FromDateTime(slotEnd);

            // Hoppa över lunchtid 11:00 - 12:00
            bool overlapsLunch =
                slotStartTime < LunchEnd && slotEndTime > LunchStart;

            if (!overlapsLunch)
            {
                bool isAvailable = !bookedSlots.Any(b =>
                    b.StartTime < slotEnd && b.EndTime > current);

                slots.Add(new TimeSlot(current, slotEnd, isAvailable));
            }

            // Hoppa förbi lunchen om nästa slot börjar i lunchtid
            var next = current.AddMinutes(SlotMinutes);
            var nextTime = TimeOnly.FromDateTime(next);
            if (nextTime >= LunchStart && nextTime < LunchEnd)
                current = date.ToDateTime(LunchEnd);
            else
                current = next;
        }

        return new DentistAvailabilityResponse(
            dentist.Id,
            $"{dentist.User.FirstName} {dentist.User.LastName}",
            date,
            slots
        );
    }

    public async Task<List<DentistAvailabilityResponse>> GetAllDentistsAvailabilityAsync(DateOnly date)
    {
        if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
            return new List<DentistAvailabilityResponse>();

        var dentists = await _db.Dentists
            .Include(d => d.User)
            .ToListAsync();

        var result = new List<DentistAvailabilityResponse>();
        foreach (var dentist in dentists)
        {
            var availability = await GetDentistAvailabilityAsync(dentist.Id, date);
            if (availability is not null)
                result.Add(availability);
        }

        return result;
    }
}