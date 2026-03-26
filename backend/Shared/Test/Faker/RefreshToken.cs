using System.Security.Cryptography;
using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class RefreshTokenFaker
{
    public static Faker<RefreshToken> RefreshTokenForTesting() =>
        new Faker<RefreshToken>()
            .RuleFor(
                r => r.Token,
                (Faker f) =>
                    Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            )
            .RuleFor(r => r.IsRevoked, false)
            .RuleFor(
                r => r.ExpiresAtUtc,
                (Faker f) => DateTime.UtcNow.AddDays(7)
            );
}
