using backend.Models;
using backend.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public abstract record CreateRefreshTokenResult;

public record NoRefreshTokenSent : CreateRefreshTokenResult;

public record RefreshTokenHasNotExpired : CreateRefreshTokenResult;

public record RefreshTokenRevoked : CreateRefreshTokenResult;

public record NewTokenPairCreated(CreateRefreshTokenResponse Tokens)
    : CreateRefreshTokenResult;

public record CreateRefreshTokenResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
}

public class CreateRefreshTokenEndpoint
{
    public async Task Create(
        HttpContext httpContext,
        [FromServices] CreateRefreshTokenHandler handler
    )
    {
        var refreshToken = httpContext.Request.Cookies["refresh_token"];

        if (refreshToken is null)
        {
            return;
        }

        await handler.Handle(refreshToken);
    }
}

// public partial class  Logger
// {
//     [LoggerMessage(Level = LogLevel.Information)]
//     public partial void LogNoRefreshTokenSent()
// }

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
            return new NoRefreshTokenSent();
        }

        if (tokenFromDb.IsRevoked)
        {
            return new RefreshTokenRevoked();
        }

        if (tokenFromDb.ExpiresAtUtc > DateTime.UtcNow)
        {
            return new RefreshTokenHasNotExpired();
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
            new CreateRefreshTokenResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = tokenFromDb.Token,
            }
        );
    }
}
