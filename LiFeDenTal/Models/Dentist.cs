namespace LiFeDenTal.Models;

public class Dentist
{
    public int Id { get; set; } // int istället för Guid, auto-increment
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string LicenseNumber { get; set; } = string.Empty;
    public string? Specialization { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
}