using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LiFeDenTal.DTOs;
using LiFeDenTal.Services;

namespace LiFeDenTal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AdminService _adminService;

    public AdminController(AdminService adminService)
    {
        _adminService = adminService;
    }

    // Skapa ny personal
    [HttpPost("staff")]
    public async Task<ActionResult<StaffResponse>> CreateStaff(CreateStaffRequest request)
    {
        var (success, error, result) = await _adminService.CreateStaffAsync(request);
        if (!success) return BadRequest(error);
        return Ok(result);
    }

    // Hämta all personal
    [HttpGet("staff")]
    public async Task<ActionResult<List<StaffResponse>>> GetAllStaff()
    {
        var result = await _adminService.GetAllStaffAsync();
        return Ok(result);
    }

    // Hämta alla patienter
    [HttpGet("patients")]
    public async Task<ActionResult<List<StaffResponse>>> GetAllPatients()
    {
        var result = await _adminService.GetAllPatientsAsync();
        return Ok(result);
    }

    // Uppdatera personal
    [HttpPut("staff/{userId}")]
    public async Task<IActionResult> UpdateStaff(int userId, UpdateStaffRequest request)
    {
        var (success, error) = await _adminService.UpdateStaffAsync(userId, request);
        if (!success) return NotFound(error);
        return Ok("Användare uppdaterad.");
    }

    // Inaktivera användare
    [HttpPut("staff/{userId}/deactivate")]
    public async Task<IActionResult> Deactivate(int userId)
    {
        var (success, error) = await _adminService.DeactivateUserAsync(userId);
        if (!success) return NotFound(error);
        return Ok("Användare inaktiverad.");
    }

    // Återaktivera användare
    [HttpPut("staff/{userId}/activate")]
    public async Task<IActionResult> Activate(int userId)
    {
        var (success, error) = await _adminService.ActivateUserAsync(userId);
        if (!success) return NotFound(error);
        return Ok("Användare återaktiverad.");
    }
}