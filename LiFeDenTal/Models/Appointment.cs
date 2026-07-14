namespace LiFeDenTal.Models;

public class Appointment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid DentistId { get; set; }
    public Dentist Dentist { get; set; } = null!;

    public Guid TreatmentRoomId { get; set; }
    public TreatmentRoom TreatmentRoom { get; set; } = null!;

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string? Reason { get; set; }
    public string? Notes { get; set; }

    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
}