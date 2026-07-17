using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LiFeDenTal.DTOs;
using LiFeDenTal.Services;

namespace LiFeDenTal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AvailabilityController : ControllerBase
{
    private readonly AvailabilityService _availabilityService;

    public AvailabilityController(AvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    // Hämta lediga tider för en specifik tandläkare på ett datum
    [HttpGet("dentist/{dentistId}")]
    public async Task<ActionResult<DentistAvailabilityResponse>> GetDentistAvailability(
        int dentistId, [FromQuery] DateOnly date)
    {
        var result = await _availabilityService.GetDentistAvailabilityAsync(dentistId, date);
        if (result is null)
            return NotFound("Tandläkaren hittades inte.");

        return Ok(result);
    }

    // Hämta lediga tider för alla tandläkare på ett datum
    [HttpGet("all")]
    public async Task<ActionResult<List<DentistAvailabilityResponse>>> GetAllAvailability(
        [FromQuery] DateOnly date)
    {
        var result = await _availabilityService.GetAllDentistsAvailabilityAsync(date);
        return Ok(result);
    }
}