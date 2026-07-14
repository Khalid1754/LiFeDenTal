using Microsoft.AspNetCore.Identity;
using LiFeDenTal.Models;

namespace LiFeDenTal.Services;

public class PasswordHasher
{
    private readonly PasswordHasher<User> _hasher = new();

    public string Hash(User user, string password) =>
        _hasher.HashPassword(user, password);

    public bool Verify(User user, string hashedPassword, string providedPassword)
    {
        if (string.IsNullOrEmpty(hashedPassword))
            return false;

        try
        {
            return _hasher.VerifyHashedPassword(user, hashedPassword, providedPassword)
                != PasswordVerificationResult.Failed;
        }
        catch (FormatException)
        {
            // Stored hash is not a valid format (corrupted or from another scheme).
            // Treat as failed verification; consider logging for investigation.
            return false;
        }
    }
}