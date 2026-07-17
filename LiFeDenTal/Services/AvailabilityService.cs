using Microsoft.EntityFrameworkCore;
using LiFeDenTal.Data;
using LiFeDenTal.DTOs;

namespace LiFeDenTal.Services;

public class AvailabilityService
{
    private readonly LiFeDenTalDbContext _db;

    // Kliniktider: 08:00 - 17:00, 30-minutersintervall
    private static readonly TimeOnly ClinicStart = new(8, 0);
    private static readonly TimeOnly ClinicEnd = new(17, 0);
    private static readonly int SlotMinutes = 30;

    public AvailabilityService(LiFeDenTalDbContext db)
    {
        _db = db;
    }

    public async Task<DentistAvailabilityResponse?> GetDentistAvailabilityAsync(int dentistId, DateOnly date)
    {
        var dentist = await _db.Dentists
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == dentistId);

        if (dentist is null) return null;

        // Hämta alla bokningar för tandläkaren på detta datum
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

        // Generera alla 30-minuters tidsluckor
        var slots = new List<TimeSlot>();
        var current = dayStart;

        while (current.AddMinutes(SlotMinutes) <= dayEnd)
        {
            var slotEnd = current.AddMinutes(SlotMinutes);

            // Kolla om tidsluckan överlappar med en befintlig bokning
            bool isAvailable = !bookedSlots.Any(b =>
                b.StartTime < slotEnd && b.EndTime > current);

            slots.Add(new TimeSlot(current, slotEnd, isAvailable));
            current = slotEnd;
        }

        return new DentistAvailabilityResponse(
            dentist.Id,
            $"{dentist.User.FirstName} {dentist.User.LastName}",
            date,
            slots
        );
    }

    // Hämta alla tandläkare med sina lediga tider för ett datum
    public async Task<List<DentistAvailabilityResponse>> GetAllDentistsAvailabilityAsync(DateOnly date)
    {
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