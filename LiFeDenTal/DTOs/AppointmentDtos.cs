namespace LiFeDenTal.DTOs;

public record CreateAppointmentRequest(
    int DentistId,
    DateTime StartTime,
    DateTime EndTime,
    string? Reason
);

public record AppointmentResponse(
    Guid Id,
    string PatientName,
    string DentistName,
    string RoomName,
    DateTime StartTime,
    DateTime EndTime,
    string Status,
    string? Reason,
    string? Notes
);

public record CancelAppointmentRequest(string? CancellationReason);