using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LiFeDenTal.DTOs;
using LiFeDenTal.Services;

namespace LiFeDenTal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly AppointmentService _appointmentService;

    public AppointmentsController(AppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    private int CurrentUserId =>
    int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string CurrentUserRole =>
        User.FindFirstValue(ClaimTypes.Role)!;

    // Patient bokar tid
    [HttpPost]
    [Authorize(Roles = "Patient")]
    public async Task<ActionResult<AppointmentResponse>> Create(CreateAppointmentRequest request)
    {
        var (success, error, result) =
            await _appointmentService.CreateAppointmentAsync(CurrentUserId, request);

        if (!success) return BadRequest(error);
        return Ok(result);
    }

    // Patient ser sina egna bokningar
    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<ActionResult<List<AppointmentResponse>>> GetMyAppointments()
    {
        var result = await _appointmentService.GetPatientAppointmentsAsync(CurrentUserId);
        return Ok(result);
    }

    // Tandläkare ser sina bokningar
    [HttpGet("dentist")]
    [Authorize(Roles = "Dentist")]
    public async Task<ActionResult<List<AppointmentResponse>>> GetDentistAppointments()
    {
        var result = await _appointmentService.GetDentistAppointmentsAsync(CurrentUserId);
        return Ok(result);
    }

    // Admin/Receptionist ser alla bokningar
    [HttpGet("all")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<List<AppointmentResponse>>> GetAll()
    {
        var result = await _appointmentService.GetAllAppointmentsAsync();
        return Ok(result);
    }

    // Avboka (patient avbokar sin egen, admin/receptionist avbokar vilken som helst)
    [HttpDelete("{id}/cancel")]
    [Authorize(Roles = "Patient,Admin,Receptionist")]
    public async Task<IActionResult> Cancel(int id, CancelAppointmentRequest request)
    {
        var (success, error) = await _appointmentService
            .CancelAppointmentAsync(id, CurrentUserId, CurrentUserRole, request.CancellationReason);

        if (!success) return BadRequest(error);
        return Ok("Bokning avbokad.");
    }
}