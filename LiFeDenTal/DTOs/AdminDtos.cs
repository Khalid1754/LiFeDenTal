namespace LiFeDenTal.DTOs;

public record CreateStaffRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    UserRoleRequest Role,
    string? LicenseNumber,
    string? Specialization
);

public enum UserRoleRequest
{
    Dentist = 1,
    DentalNurse = 2,
    DentalHygienist = 3,
    Receptionist = 4,
    Admin = 5
}

public record StaffResponse(
    int Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string Role,
    bool IsActive
);

public record UpdateStaffRequest(
    string? FirstName,
    string? LastName,
    string? PhoneNumber,
    bool? IsActive
);