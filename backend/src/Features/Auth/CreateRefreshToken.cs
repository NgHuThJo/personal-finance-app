using backend.Models;
using backend.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public static partial class CreateRefreshToken
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User has no active refresh token"
    )]
    public static partial void UserHasNoActiveRefreshToken(ILogger logger);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Refresh token has not expired"
    )]
    public static partial void RefreshTokenHasExpired(ILogger logger);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Refresh token revoked"
    )]
    public static partial void RefreshTokenRevoked(ILogger logger);
}

public abstract record CreateRefreshTokenResult;

public record UserHasNoActiveRefreshToken : CreateRefreshTokenResult;

public record RefreshTokenHasExpired : CreateRefreshTokenResult;

public record RefreshTokenRevoked : CreateRefreshTokenResult;

public record NewTokenPairCreated(string AccessToken, string RefreshToken)
    : CreateRefreshTokenResult;

public record CreateRefreshTokenResponse
{
    public required string AccessToken { get; set; }
}

public class CreateRefreshTokenEndpoint
{
    public static async Task<
        Results<ProblemHttpResult, Ok<CreateRefreshTokenResponse>>
    > Get(
        HttpContext httpContext,
        [FromServices] CreateRefreshTokenHandler handler
    )
    {
        var refreshToken = httpContext.Request.Cookies["refresh_token"];

        if (refreshToken is null)
        {
            return TypedResultsProblemDetails.Unauthorized(
                "No refresh token found in request header"
            );
        }

        var tokens = await handler.Handle(refreshToken);
        // Delete refresh token for cases where user is not authenticated
        httpContext.Response.Cookies.Delete("refresh_token");

        switch (tokens)
        {
            case UserHasNoActiveRefreshToken:
            {
                return TypedResultsProblemDetails.Unauthorized(
                    "User has no active  refresh token"
                );
            }
            case RefreshTokenHasExpired:
            {
                return TypedResultsProblemDetails.Unauthorized(
                    "Refresh token has not expired"
                );
            }
            case RefreshTokenRevoked:
            {
                return TypedResultsProblemDetails.Unauthorized(
                    "Refresh token revoked"
                );
            }
            case NewTokenPairCreated(var access, var refresh):
            {
                httpContext.Response.Cookies.Append(
                    "refresh_token",
                    refresh,
                    new CookieOptions
                    {
                        MaxAge = TimeSpan.FromDays(7),
                        Secure = true,
                        HttpOnly = true,
                        SameSite = SameSiteMode.None,
                    }
                );

                return TypedResults.Ok(
                    new CreateRefreshTokenResponse { AccessToken = access }
                );
            }
            default:
            {
                throw new NotSupportedException(
                    $"An unknown error occurred in {typeof(CreateRefreshTokenEndpoint).Name}"
                );
            }
        }
        ;
    }
}

public class CreateRefreshTokenHandler(
    AppDbContext context,
    JwtTokenProvider provider,
    ILogger<CreateRefreshTokenHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly JwtTokenProvider _provider = provider;
    private readonly ILogger<CreateRefreshTokenHandler> _logger = logger;

    public async Task<CreateRefreshTokenResult> Handle(string refreshToken)
    {
        var tokenFromDb = await _context
            .RefreshTokens.Include(r => r.User)
            .Where(r => r.Token == refreshToken)
            .FirstOrDefaultAsync();

        if (tokenFromDb is null)
        {
            CreateRefreshToken.UserHasNoActiveRefreshToken(_logger);
            return new UserHasNoActiveRefreshToken();
        }

        if (tokenFromDb.IsRevoked)
        {
            CreateRefreshToken.RefreshTokenRevoked(_logger);
            return new RefreshTokenRevoked();
        }

        if (tokenFromDb.ExpiresAtUtc < DateTime.UtcNow)
        {
            CreateRefreshToken.RefreshTokenHasExpired(_logger);
            return new RefreshTokenHasExpired();
        }

        var newAccessToken = _provider.GenerateAccessToken(tokenFromDb.UserId);
        tokenFromDb.Token = _provider.GenerateRefreshToken();
        tokenFromDb.ExpiresAtUtc = DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync();
        await _context
            .RefreshTokens.Where(r =>
                r.UserId == tokenFromDb.UserId && r.Token != tokenFromDb.Token
            )
            .ExecuteDeleteAsync();

        return new NewTokenPairCreated(
            AccessToken: newAccessToken,
            RefreshToken: tokenFromDb.Token
        );
    }
}
