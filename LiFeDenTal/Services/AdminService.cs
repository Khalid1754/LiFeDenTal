using Microsoft.EntityFrameworkCore;
using LiFeDenTal.Data;
using LiFeDenTal.DTOs;
using LiFeDenTal.Models;

namespace LiFeDenTal.Services;

public class AdminService
{
    private readonly LiFeDenTalDbContext _db;

    public AdminService(LiFeDenTalDbContext db)
    {
        _db = db;
    }

    // Skapa ny personal
    public async Task<(bool Success, string? Error, StaffResponse? Result)>
        CreateStaffAsync(CreateStaffRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return (false, "Email är redan registrerad.", null);

        var role = (UserRole)request.Role;

        var user = new User
        {
            Email = request.Email,
            Password = request.Password,
            PasswordHash = "",
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Role = role,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(); // Spara user först för att få Id

        if (role == UserRole.Dentist)
        {
            if (string.IsNullOrWhiteSpace(request.LicenseNumber))
                return (false, "LicenseNumber krävs för tandläkare.", null);

            _db.Dentists.Add(new Dentist
            {
                UserId = user.Id,
                LicenseNumber = request.LicenseNumber,
                Specialization = request.Specialization
            });
        }
        else
        {
            _db.ClinicStaff.Add(new ClinicStaff
            {
                UserId = user.Id,
                Position = role
            });
        }

        await _db.SaveChangesAsync();

        return (true, null, new StaffResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.Role.ToString(),
            user.IsActive
        ));
    }

    // Hämta all personal (exkl. patienter)
    public async Task<List<StaffResponse>> GetAllStaffAsync()
    {
        var staff = await _db.Users
            .Where(u => u.Role != UserRole.Patient)
            .OrderBy(u => u.Role)
            .ThenBy(u => u.LastName)
            .ToListAsync();

        return staff.Select(u => new StaffResponse(
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.PhoneNumber,
            u.Role.ToString(),
            u.IsActive
        )).ToList();
    }

    // Hämta alla patienter
    public async Task<List<StaffResponse>> GetAllPatientsAsync()
    {
        var patients = await _db.Users
            .Where(u => u.Role == UserRole.Patient)
            .OrderBy(u => u.LastName)
            .ToListAsync();

        return patients.Select(u => new StaffResponse(
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.PhoneNumber,
            u.Role.ToString(),
            u.IsActive
        )).ToList();
    }

    // Uppdatera personal
    public async Task<(bool Success, string? Error)> UpdateStaffAsync(int userId, UpdateStaffRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null)
            return (false, "Användaren hittades inte.");

        if (request.FirstName is not null) user.FirstName = request.FirstName;
        if (request.LastName is not null) user.LastName = request.LastName;
        if (request.PhoneNumber is not null) user.PhoneNumber = request.PhoneNumber;
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync();
        return (true, null);
    }

    // Inaktivera användare (soft delete)
    public async Task<(bool Success, string? Error)> DeactivateUserAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null)
            return (false, "Användaren hittades inte.");

        user.IsActive = false;
        await _db.SaveChangesAsync();
        return (true, null);
    }

    // Återaktivera användare
    public async Task<(bool Success, string? Error)> ActivateUserAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null)
            return (false, "Användaren hittades inte.");

        user.IsActive = true;
        await _db.SaveChangesAsync();
        return (true, null);
    }
}