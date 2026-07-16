namespace LiFeDenTal.Models;

public class MedicalRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public int PatientId { get; set; } // int
    public Patient Patient { get; set; } = null!;

    public int DentistId { get; set; } // int
    public Dentist Dentist { get; set; } = null!;

    public Guid? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public string Diagnosis { get; set; } = string.Empty;
    public string Treatment { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Prescription { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}