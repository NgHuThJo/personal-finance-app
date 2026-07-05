using backend.Src.Models;
using backend.Src.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Src.Shared.GlobalConstants;

namespace backend.Src.Features;

public record LoginGuestUserResponse
{
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
}

public static class LoginGuestUserEndpoint
{
    public static async Task<Ok<string>> LoginGuestUser(
        [FromServices] LoginGuestUserHandler handler,
        HttpContext httpContext,
        CancellationToken ct
    )
    {
        var user = await handler.Handle(ct);

        httpContext.Response.Cookies.Append(
            "refresh_token",
            user.RefreshToken,
            new CookieOptions
            {
                MaxAge = TimeSpan.FromDays(7),
                Secure = true,
                HttpOnly = true,
                SameSite = SameSiteMode.None,
            }
        );

        return TypedResults.Ok(user.AccessToken);
    }
}

public class LoginGuestUserHandler(
    AppDbContext context,
    JwtTokenProvider provider
)
{
    private readonly AppDbContext _context = context;
    private readonly JwtTokenProvider _provider = provider;

    public async Task<LoginGuestUserResponse> Handle(CancellationToken ct)
    {
        var user = await _context
            .Users.Select(u => new { u.Email, u.Id })
            .Where(u =>
                u.Email.ToLower() == GUEST_ACCOUNT_EMAIL_ADDRESS.ToLower()
            )
            .SingleAsync(ct);

        var accessToken = _provider.GenerateAccessToken(user.Id);
        var refreshToken = new RefreshToken
        {
            Token = _provider.GenerateRefreshToken(),
            UserId = user.Id,
            ExpiresAtUtc = DateTimeOffset.UtcNow.AddDays(7),
        };

        _context.Add(refreshToken);

        await _context.SaveChangesAsync(ct);

        return new LoginGuestUserResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
        };
    }
}
