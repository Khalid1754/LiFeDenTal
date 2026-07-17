namespace LiFeDenTal.DTOs;

public record AvailabilityRequest(
    int DentistId,
    DateOnly Date
);

public record TimeSlot(
    DateTime StartTime,
    DateTime EndTime,
    bool IsAvailable
);

public record DentistAvailabilityResponse(
    int DentistId,
    string DentistName,
    DateOnly Date,
    List<TimeSlot> TimeSlots
);