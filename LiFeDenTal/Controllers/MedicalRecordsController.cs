using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LiFeDenTal.DTOs;
using LiFeDenTal.Services;

namespace LiFeDenTal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicalRecordsController : ControllerBase
{
    private readonly MedicalRecordService _medicalRecordService;

    public MedicalRecordsController(MedicalRecordService medicalRecordService)
    {
        _medicalRecordService = medicalRecordService;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string CurrentUserRole =>
        User.FindFirstValue(ClaimTypes.Role)!;

    // Tandläkare skapar journalanteckning
    [HttpPost]
    [Authorize(Roles = "Dentist")]
    public async Task<ActionResult<MedicalRecordResponse>> Create(CreateMedicalRecordRequest request)
    {
        var (success, error, result) =
            await _medicalRecordService.CreateAsync(CurrentUserId, request);

        if (!success) return BadRequest(error);
        return Ok(result);
    }

    // Patient ser sina egna journalanteckningar
    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<ActionResult<List<MedicalRecordResponse>>> GetMyRecords()
    {
        var result = await _medicalRecordService.GetPatientRecordsAsync(CurrentUserId);
        return Ok(result);
    }

    // Tandläkare ser journalanteckningar för en specifik patient
    [HttpGet("patient/{patientId}")]
    [Authorize(Roles = "Dentist")]
    public async Task<ActionResult<List<MedicalRecordResponse>>> GetByPatient(int patientId)
    {
        var result = await _medicalRecordService.GetRecordsByPatientAsync(patientId, CurrentUserId);
        return Ok(result);
    }

    // Admin ser alla journalanteckningar
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<MedicalRecordResponse>>> GetAll()
    {
        var result = await _medicalRecordService.GetAllAsync();
        return Ok(result);
    }
}