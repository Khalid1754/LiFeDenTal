namespace LiFeDenTal.Models;

public class ClinicStaff
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public UserRole Position { get; set; } // DentalNurse, DentalHygienist, Receptionist, Admin
    public string? Notes { get; set; }
}