using backend.Src.Models;
using backend.Src.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public static partial class LogoutUserLogger
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Number of refresh tokens deleted: {RowCount}"
    )]
    public static partial void RefreshTokenDeleted(
        ILogger logger,
        int rowCount
    );

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "No refresh token found in cookie"
    )]
    public static partial void NoRefreshTokenFoundInCookie(ILogger logger);
}

public abstract record LogoutUserResult;

public record NoRefreshTokenFoundInDb : LogoutUserResult;

public static class LogoutUserEndpoint
{
    public static async Task<Results<NoContent, ProblemHttpResult>> Logout(
        HttpContext httpContext,
        ILoggerFactory loggerFactory,
        [FromServices] LogoutUserHandler handler
    )
    {
        var logger = loggerFactory.CreateLogger("LogoutUserEndpoint");
        var refreshToken = httpContext.Request.Cookies["refresh_token"];

        if (refreshToken is null)
        {
            LogoutUserLogger.NoRefreshTokenFoundInCookie(logger);
            return TypedResultsProblemDetails.Forbidden(
                "No refresh token found in cookie"
            );
        }

        await handler.Handle(refreshToken);

        // This line is really important
        httpContext.Response.Cookies.Delete("refresh_token");

        return TypedResults.NoContent();
    }
}

public class LogoutUserHandler(
    AppDbContext context,
    ILogger<LogoutUserHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<LogoutUserHandler> _logger = logger;

    public async Task Handle(string refreshToken)
    {
        var rowCountDeleted = await _context
            .RefreshTokens.Where(r => r.Token == refreshToken)
            .ExecuteDeleteAsync();

        if (rowCountDeleted >= 1)
        {
            LogoutUserLogger.RefreshTokenDeleted(_logger, rowCountDeleted);
        }

        return;
    }
}
