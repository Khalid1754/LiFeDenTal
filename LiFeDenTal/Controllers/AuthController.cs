using LiFeDenTal.Data;
using LiFeDenTal.DTOs;
using LiFeDenTal.Models;
using LiFeDenTal.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LiFeDenTal.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LiFeDenTalDbContext _db;
    private readonly PasswordHasher _hasher;

    public AuthController(LiFeDenTalDbContext db, PasswordHasher hasher)
    {
        _db = db;
        _hasher = hasher;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict("Email är redan registrerad.");

        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Patient
        };
        user.PasswordHash = _hasher.Hash(user, request.Password);

        _db.Users.Add(user);

        // Skapa patientprofil automatiskt
        var patient = new Patient
        {
            UserId = user.Id,
            DateOfBirth = DateOnly.FromDateTime(DateTime.Today) // placeholder
        };
        _db.Patients.Add(patient);

        await _db.SaveChangesAsync();

        return Ok(new UserResponse(user.Id, user.Email, user.FirstName, user.LastName, user.Role.ToString()));
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login(LoginRequest request)
    {
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == request.Email);
        if (user is null || !user.IsActive)
            return Unauthorized("Fel email eller lösenord.");

        // Personal (Dentist, Nurse, Receptionist, Admin) — klartext
        bool passwordOk;
        if (user.Role != UserRole.Patient)
        {
            passwordOk = user.Password == request.Password;
        }
        else
        {
            // Patienter använder fortfarande hashning
            passwordOk = _hasher.Verify(user, user.PasswordHash, request.Password);
        }

        if (!passwordOk)
            return Unauthorized("Fel email eller lösenord.");

        var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Email, user.Email),
        new(ClaimTypes.GivenName, user.FirstName),
        new(ClaimTypes.Role, user.Role.ToString())
    };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

        return Ok(new UserResponse(user.Id, user.Email, user.FirstName, user.LastName, user.Role.ToString()));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok();
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<UserResponse> Me()
    {
        var id = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var email = User.FindFirstValue(ClaimTypes.Email)!;
        var firstName = User.FindFirstValue(ClaimTypes.GivenName)!;
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        return Ok(new UserResponse(id, email, "", firstName, role));
    }

    [HttpGet("dev/generate-hashes")]
    public IActionResult GenerateHashes()
    {
        var hasher = new PasswordHasher<User>();
        var dummy = new User();

        return Ok(new
        {
            AdminHash = hasher.HashPassword(dummy, "Admin123!"),
            DentistHash = hasher.HashPassword(dummy, "Dentist123!")
        });
    }
}