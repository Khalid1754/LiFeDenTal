namespace LiFeDenTal.DTOs;

public record CreateMedicalRecordRequest(
    int PatientId,
    int? AppointmentId,
    string Diagnosis,
    string Treatment,
    string? Notes,
    string? Prescription
);

public record MedicalRecordResponse(
    int Id,
    string PatientName,
    string DentistName,
    int? AppointmentId,
    string Diagnosis,
    string Treatment,
    string? Notes,
    string? Prescription,
    DateTime CreatedAt
);
