namespace LiFeDenTal.Models;

public class Appointment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public int PatientId { get; set; } // int
    public Patient Patient { get; set; } = null!;

    public int DentistId { get; set; } // int
    public Dentist Dentist { get; set; } = null!;

    public int TreatmentRoomId { get; set; } // int
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