using System.ComponentModel.DataAnnotations;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public static partial class LoginUserLogger
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Passwords do not match"
    )]
    public static partial void PasswordsDoNotMatch(ILogger logger);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Email address {Email} does not exist"
    )]
    public static partial void EmailDoesNotExist(ILogger logger, string email);
}

public abstract record LoginUserResult;

public record PasswordsDoNotMatch : LoginUserResult;

public record EmailDoesNotExist(string Email) : LoginUserResult;

public record LoginSuccessful(LoginUserResponse Token) : LoginUserResult;

public record LoginUserRequest
{
    [EmailAddress(ErrorMessage = "Email address is invalid")]
    public required string Email { get; init; }

    [MinLength(8)]
    public required string Password { get; init; }
}

public record LoginUserResponse
{
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
}

public class LoginUserValidator : AbstractValidator<LoginUserRequest>
{
    public LoginUserValidator()
    {
        RuleFor(u => u.Email).EmailAddress();
        RuleFor(u => u.Password).MinimumLength(8);
    }
}

public sealed class LoginUserEndpoint
{
    public static async Task<
        Results<
            Ok<LoginUserResponse>,
            UnauthorizedHttpResult,
            ProblemHttpResult
        >
    > Login(
        [FromBody] LoginUserRequest command,
        [FromServices] LoginUserHandler handler
    )
    {
        var handlerResult = await handler.Handle(command);

        return handlerResult switch
        {
            EmailDoesNotExist(var email) => TypedResultsProblemDetails.Conflict(
                $"Email address {email} does not exist"
            ),
            PasswordsDoNotMatch => TypedResultsProblemDetails.Unauthorized(
                "Passwords do not match"
            ),
            LoginSuccessful(var token) => TypedResults.Ok(token),
            _ => throw new NotSupportedException(
                "An unknown error has occurred in LoginUserEndPoint"
            ),
        };
    }
}

public class LoginUserHandler(
    AppDbContext context,
    JwtTokenProvider tokenProvider,
    ILogger<LoginUserHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly JwtTokenProvider _tokenProvider = tokenProvider;
    private readonly ILogger<LoginUserHandler> _logger = logger;

    public async Task<LoginUserResult> Handle(LoginUserRequest command)
    {
        var userInfo = await _context
            .Users.Select(u => new
            {
                u.Email,
                u.Password,
                u.Id,
            })
            .SingleOrDefaultAsync(u =>
                u.Email.ToLower() == command.Email.ToLower()
            );

        if (userInfo is null)
        {
            LoginUserLogger.EmailDoesNotExist(_logger, command.Email);
            return new EmailDoesNotExist(command.Email);
        }

        var passwordVerificationResult = PasswordHasher.VerifyHashedPassword(
            userInfo.Password,
            command.Password
        );

        if (passwordVerificationResult == PasswordVerificationResult.Failed)
        {
            LoginUserLogger.PasswordsDoNotMatch(_logger);
            return new PasswordsDoNotMatch();
        }

        var accessToken = _tokenProvider.GenerateAccessToken(userInfo.Id);
        var refreshToken = new RefreshToken
        {
            Token = _tokenProvider.GenerateRefreshToken(),
            UserId = userInfo.Id,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7),
        };

        _context.Add(refreshToken);

        await _context.SaveChangesAsync();

        return new LoginSuccessful(
            new LoginUserResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
            }
        );
    }
}
