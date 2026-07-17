using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LiFeDenTal.Data;
using LiFeDenTal.DTOs;
using LiFeDenTal.Models;
using LiFeDenTal.Services;
using Microsoft.EntityFrameworkCore;

namespace LiFeDenTal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Receptionist,Admin")]
public class ReceptionistController : ControllerBase
{
    private readonly LiFeDenTalDbContext _db;
    private readonly AppointmentService _appointmentService;

    public ReceptionistController(LiFeDenTalDbContext db, AppointmentService appointmentService)
    {
        _db = db;
        _appointmentService = appointmentService;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Boka tid åt en patient
    [HttpPost("appointments")]
    public async Task<ActionResult<AppointmentResponse>> CreateForPatient(
        CreateAppointmentForPatientRequest request)
    {
        if (request.StartTime >= request.EndTime)
            return BadRequest("Sluttid måste vara efter starttid.");

        // Kolla att patienten finns
        var patient = await _db.Patients
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == request.PatientId);
        if (patient is null)
            return NotFound("Patienten hittades inte.");

        // Kolla att tandläkaren finns
        var dentist = await _db.Dentists
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == request.DentistId);
        if (dentist is null)
            return NotFound("Tandläkaren hittades inte.");

        // Kolla att tandläkaren är ledig
        bool dentistBusy = await _db.Appointments.AnyAsync(a =>
            a.DentistId == request.DentistId &&
            a.Status != AppointmentStatus.Cancelled &&
            a.StartTime < request.EndTime &&
            a.EndTime > request.StartTime);
        if (dentistBusy)
            return BadRequest("Tandläkaren är redan bokad på denna tid.");

        // Hitta ledigt rum
        var bookedRoomIds = await _db.Appointments
            .Where(a =>
                a.Status != AppointmentStatus.Cancelled &&
                a.StartTime < request.EndTime &&
                a.EndTime > request.StartTime)
            .Select(a => a.TreatmentRoomId)
            .ToListAsync();

        var room = await _db.TreatmentRooms
            .Where(r => r.IsActive && !bookedRoomIds.Contains(r.Id))
            .OrderBy(r => r.Name)
            .FirstOrDefaultAsync();
        if (room is null)
            return BadRequest("Inga lediga behandlingsrum på denna tid.");

        var appointment = new Appointment
        {
            PatientId = patient.Id,
            DentistId = dentist.Id,
            TreatmentRoomId = room.Id,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Reason = request.Reason,
            Status = AppointmentStatus.Scheduled,
            CreatedByUserId = CurrentUserId
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        return Ok(new AppointmentResponse(
            appointment.Id,
            $"{patient.User.FirstName} {patient.User.LastName}",
            $"{dentist.User.FirstName} {dentist.User.LastName}",
            room.Name,
            appointment.StartTime,
            appointment.EndTime,
            appointment.Status.ToString(),
            appointment.Reason,
            appointment.Notes
        ));
    }

    // Se alla bokningar
    [HttpGet("appointments")]
    public async Task<ActionResult<List<AppointmentResponse>>> GetAllAppointments()
    {
        var result = await _appointmentService.GetAllAppointmentsAsync();
        return Ok(result);
    }

    // Se bokningar för en specifik patient
    [HttpGet("appointments/patient/{patientId}")]
    public async Task<ActionResult<List<AppointmentResponse>>> GetByPatient(int patientId)
    {
        var appointments = await _db.Appointments
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Dentist).ThenInclude(d => d.User)
            .Include(a => a.TreatmentRoom)
            .Where(a => a.PatientId == patientId)
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        var result = appointments.Select(a => new AppointmentResponse(
            a.Id,
            $"{a.Patient.User.FirstName} {a.Patient.User.LastName}",
            $"{a.Dentist.User.FirstName} {a.Dentist.User.LastName}",
            a.TreatmentRoom.Name,
            a.StartTime,
            a.EndTime,
            a.Status.ToString(),
            a.Reason,
            a.Notes
        )).ToList();

        return Ok(result);
    }

    // Uppdatera status på en bokning
    [HttpPut("appointments/{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateAppointmentStatusRequest request)
    {
        var appointment = await _db.Appointments.FindAsync(id);
        if (appointment is null)
            return NotFound("Bokning hittades inte.");

        if (!Enum.TryParse<AppointmentStatus>(request.Status, out var newStatus))
            return BadRequest($"Ogiltigt status. Giltiga värden: {string.Join(", ", Enum.GetNames<AppointmentStatus>())}");

        appointment.Status = newStatus;
        await _db.SaveChangesAsync();

        return Ok($"Status uppdaterat till {newStatus}.");
    }

    // Avboka
    [HttpDelete("appointments/{id}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancelAppointmentRequest request)
    {
        var (success, error) = await _appointmentService
            .CancelAppointmentAsync(id, CurrentUserId, "Receptionist", request.CancellationReason);

        if (!success) return BadRequest(error);
        return Ok("Bokning avbokad.");
    }

    // Lista alla patienter
    [HttpGet("patients")]
    public async Task<IActionResult> GetAllPatients()
    {
        var patients = await _db.Patients
            .Include(p => p.User)
            .Select(p => new
            {
                p.Id,
                p.User.FirstName,
                p.User.LastName,
                p.User.Email,
                p.User.PhoneNumber,
                p.DateOfBirth
            })
            .ToListAsync();

        return Ok(patients);
    }
}