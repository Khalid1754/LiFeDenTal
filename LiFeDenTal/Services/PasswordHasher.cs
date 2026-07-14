using Microsoft.AspNetCore.Identity;
using LiFeDenTal.Models;

namespace LiFeDenTal.Services;

public class PasswordHasher
{
    private readonly PasswordHasher<User> _hasher = new();

    public string Hash(User user, string password) =>
        _hasher.HashPassword(user, password);

    public bool Verify(User user, string hashedPassword, string providedPassword) =>
        _hasher.VerifyHashedPassword(user, hashedPassword, providedPassword)
            != PasswordVerificationResult.Failed;
}