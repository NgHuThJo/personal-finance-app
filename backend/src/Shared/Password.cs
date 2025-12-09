using Microsoft.AspNetCore.Identity;

namespace backend.Shared;

public static class PasswordHasher
{
    private static readonly PasswordHasher<object> _hasher = new();

    public static string HashPassword(string password)
    {
        return _hasher.HashPassword(null!, password);
    }

    public static PasswordVerificationResult VerifyHashedPassword(
        string hashedPassword,
        string providedPassword
    )
    {
        return _hasher.VerifyHashedPassword(
            null!,
            hashedPassword,
            providedPassword
        );
    }
}
