namespace LiFeDenTal.Models;

public class TreatmentRoom
{
    public int Id { get; set; } // int auto-increment
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}