namespace LiFeDenTal.DTOs;

public record CreateAppointmentForPatientRequest(
    int PatientId,
    int DentistId,
    DateTime StartTime,
    DateTime EndTime,
    string? Reason
);

public record UpdateAppointmentStatusRequest(string Status);