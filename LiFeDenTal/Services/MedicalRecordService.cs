using Microsoft.EntityFrameworkCore;
using LiFeDenTal.Data;
using LiFeDenTal.DTOs;
using LiFeDenTal.Models;

namespace LiFeDenTal.Services;

public class MedicalRecordService
{
    private readonly LiFeDenTalDbContext _db;

    public MedicalRecordService(LiFeDenTalDbContext db)
    {
        _db = db;
    }

    // Tandläkare skapar journalanteckning
    public async Task<(bool Success, string? Error, MedicalRecordResponse? Result)>
        CreateAsync(int dentistUserId, CreateMedicalRecordRequest request)
    {
        // Hämta tandläkarprofil
        var dentist = await _db.Dentists
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.UserId == dentistUserId);
        if (dentist is null)
            return (false, "Tandläkarprofil hittades inte.", null);

        // Kolla att patienten finns
        var patient = await _db.Patients
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == request.PatientId);
        if (patient is null)
            return (false, "Patienten hittades inte.", null);

        // Om AppointmentId anges, kolla att den tillhör rätt patient och tandläkare
        if (request.AppointmentId.HasValue)
        {
            var appointment = await _db.Appointments
                .FirstOrDefaultAsync(a =>
                    a.Id == request.AppointmentId.Value &&
                    a.PatientId == patient.Id &&
                    a.DentistId == dentist.Id);
            if (appointment is null)
                return (false, "Bokningen hittades inte eller tillhör inte denna patient/tandläkare.", null);
        }

        var record = new MedicalRecord
        {
            PatientId = patient.Id,
            DentistId = dentist.Id,
            AppointmentId = request.AppointmentId,
            Diagnosis = request.Diagnosis,
            Treatment = request.Treatment,
            Notes = request.Notes,
            Prescription = request.Prescription
        };

        _db.MedicalRecords.Add(record);
        await _db.SaveChangesAsync();

        return (true, null, MapToResponse(record, patient.User, dentist.User));
    }

    // Patient hämtar sina egna journalanteckningar
    public async Task<List<MedicalRecordResponse>> GetPatientRecordsAsync(int patientUserId)
    {
        var records = await _db.MedicalRecords
            .Include(r => r.Patient).ThenInclude(p => p.User)
            .Include(r => r.Dentist).ThenInclude(d => d.User)
            .Where(r => r.Patient.UserId == patientUserId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return records.Select(r => MapToResponse(r, r.Patient.User, r.Dentist.User)).ToList();
    }

    // Tandläkare hämtar journalanteckningar för en specifik patient
    public async Task<List<MedicalRecordResponse>> GetRecordsByPatientAsync(int patientId, int dentistUserId)
    {
        var records = await _db.MedicalRecords
            .Include(r => r.Patient).ThenInclude(p => p.User)
            .Include(r => r.Dentist).ThenInclude(d => d.User)
            .Where(r => r.PatientId == patientId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return records.Select(r => MapToResponse(r, r.Patient.User, r.Dentist.User)).ToList();
    }

    // Admin hämtar alla journalanteckningar
    public async Task<List<MedicalRecordResponse>> GetAllAsync()
    {
        var records = await _db.MedicalRecords
            .Include(r => r.Patient).ThenInclude(p => p.User)
            .Include(r => r.Dentist).ThenInclude(d => d.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return records.Select(r => MapToResponse(r, r.Patient.User, r.Dentist.User)).ToList();
    }

    private static MedicalRecordResponse MapToResponse(
        MedicalRecord r, User patientUser, User dentistUser) =>
        new(
            r.Id,
            $"{patientUser.FirstName} {patientUser.LastName}",
            $"{dentistUser.FirstName} {dentistUser.LastName}",
            r.AppointmentId,
            r.Diagnosis,
            r.Treatment,
            r.Notes,
            r.Prescription,
            r.CreatedAt
        );
}