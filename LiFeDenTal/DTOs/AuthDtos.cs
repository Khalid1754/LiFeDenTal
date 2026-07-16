namespace LiFeDenTal.DTOs;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber
);

public record LoginRequest(string Email, string Password);

public record UserResponse(
    int Id,  // int istället för Guid
    string Email,
    string FirstName,
    string LastName,
    string Role
);