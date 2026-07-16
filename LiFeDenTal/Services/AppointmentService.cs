using Microsoft.EntityFrameworkCore;
using LiFeDenTal.Data;
using LiFeDenTal.DTOs;
using LiFeDenTal.Models;

namespace LiFeDenTal.Services;

public class AppointmentService
{
    private readonly LiFeDenTalDbContext _db;

    public AppointmentService(LiFeDenTalDbContext db)
    {
        _db = db;
    }

    // Hitta första lediga rum vid given tid
    private async Task<TreatmentRoom?> FindAvailableRoomAsync(DateTime start, DateTime end)
    {
        var bookedRoomIds = await _db.Appointments
            .Where(a =>
                a.Status != AppointmentStatus.Cancelled &&
                a.StartTime < end &&
                a.EndTime > start)
            .Select(a => a.TreatmentRoomId)
            .ToListAsync();

        return await _db.TreatmentRooms
            .Where(r => r.IsActive && !bookedRoomIds.Contains(r.Id))
            .OrderBy(r => r.Name)
            .FirstOrDefaultAsync();
    }

    // Kolla om tandläkaren är ledig
    private async Task<bool> IsDentistAvailableAsync(int dentistId, DateTime start, DateTime end)
    {
        return !await _db.Appointments.AnyAsync(a =>
            a.DentistId == dentistId &&
            a.Status != AppointmentStatus.Cancelled &&
            a.StartTime < end &&
            a.EndTime > start);
    }

    // Patient bokar tid
    public async Task<(bool Success, string? Error, AppointmentResponse? Result)>
    CreateAppointmentAsync(Guid patientUserId, CreateAppointmentRequest request)
    {
        // Validera tid
        if (request.StartTime >= request.EndTime)
            return (false, "Sluttid måste vara efter starttid.", null);

        if (request.StartTime < DateTime.Now)
            return (false, "Kan inte boka tid i det förflutna.", null);

        // Hämta patientprofil
        var patient = await _db.Patients
            .FirstOrDefaultAsync(p => p.UserId == patientUserId);
        if (patient is null)
            return (false, "Patientprofil hittades inte.", null);

        // Kolla att tandläkaren finns
        var dentist = await _db.Dentists
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == request.DentistId);
        if (dentist is null)
            return (false, "Tandläkaren hittades inte.", null);

        // Kolla att tandläkaren är ledig
        if (!await IsDentistAvailableAsync(request.DentistId, request.StartTime, request.EndTime))
            return (false, "Tandläkaren är redan bokad på denna tid.", null);

        // Hitta ledigt rum
        var room = await FindAvailableRoomAsync(request.StartTime, request.EndTime);
        if (room is null)
            return (false, "Inga lediga behandlingsrum finns på denna tid.", null);

        var appointment = new Appointment
        {
            PatientId = patient.Id,
            DentistId = dentist.Id,
            TreatmentRoomId = room.Id,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Reason = request.Reason,
            Status = AppointmentStatus.Scheduled,
            CreatedByUserId = patientUserId
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        return (true, null, MapToResponse(appointment, patient.User, dentist.User, room));
    }

    // Hämta bokningar för en specifik patient
    public async Task<List<AppointmentResponse>> GetPatientAppointmentsAsync(Guid patientUserId)
    {
        var appointments = await _db.Appointments
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Dentist).ThenInclude(d => d.User)
            .Include(a => a.TreatmentRoom)
            .Where(a => a.Patient.UserId == patientUserId)
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        return appointments.Select(a =>
            MapToResponse(a, a.Patient.User, a.Dentist.User, a.TreatmentRoom)).ToList();
    }

    // Hämta bokningar för en specifik tandläkare
    public async Task<List<AppointmentResponse>> GetDentistAppointmentsAsync(Guid dentistUserId)
    {
        var appointments = await _db.Appointments
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Dentist).ThenInclude(d => d.User)
            .Include(a => a.TreatmentRoom)
            .Where(a => a.Dentist.UserId == dentistUserId)
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        return appointments.Select(a =>
            MapToResponse(a, a.Patient.User, a.Dentist.User, a.TreatmentRoom)).ToList();
    }

    // Hämta alla bokningar (Admin/Receptionist)
    public async Task<List<AppointmentResponse>> GetAllAppointmentsAsync()
    {
        var appointments = await _db.Appointments
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Dentist).ThenInclude(d => d.User)
            .Include(a => a.TreatmentRoom)
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        return appointments.Select(a =>
            MapToResponse(a, a.Patient.User, a.Dentist.User, a.TreatmentRoom)).ToList();
    }

    // Avboka
    public async Task<(bool Success, string? Error)> CancelAppointmentAsync(
        Guid appointmentId, Guid requestingUserId, string userRole, string? reason)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment is null)
            return (false, "Bokning hittades inte.");

        if (appointment.Status == AppointmentStatus.Cancelled)
            return (false, "Bokningen är redan avbokad.");

        // Patient kan bara avboka sina egna bokningar
        if (userRole == "Patient" && appointment.Patient.UserId != requestingUserId)
            return (false, "Du kan inte avboka någon annans bokning.");

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.CancelledAt = DateTime.UtcNow;
        appointment.CancellationReason = reason;

        await _db.SaveChangesAsync();
        return (true, null);
    }

    private static AppointmentResponse MapToResponse(
        Appointment a, User patientUser, User dentistUser, TreatmentRoom room) =>
        new(
            a.Id,
            $"{patientUser.FirstName} {patientUser.LastName}",
            $"{dentistUser.FirstName} {dentistUser.LastName}",
            room.Name,
            a.StartTime,
            a.EndTime,
            a.Status.ToString(),
            a.Reason,
            a.Notes
        );
}