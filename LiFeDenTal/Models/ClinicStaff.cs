namespace LiFeDenTal.Models;

public class ClinicStaff
{
    public int Id { get; set; } // int auto-increment
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public UserRole Position { get; set; }
    public string? Notes { get; set; }
}