namespace LiFeDenTal.Models;

public class TreatmentRoom
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty; // "Rum 1", "Rum 2", "Rum 3"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}