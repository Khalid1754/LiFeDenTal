namespace LiFeDenTal.Models;

public class User
{
    public int Id { get; set; } // int auto-increment
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Patient? PatientProfile { get; set; }
    public Dentist? DentistProfile { get; set; }
    public ClinicStaff? StaffProfile { get; set; }
}