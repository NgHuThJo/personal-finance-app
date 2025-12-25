using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace backend.Features;

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
    public required string Token { get; init; }
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
        Results<Ok<LoginUserResponse>, UnauthorizedHttpResult, Conflict<string>>
    > Login(
        [FromBody] LoginUserRequest command,
        [FromServices] LoginUserHandler handler
    )
    {
        var handlerResult = await handler.Handle(command);

        return handlerResult switch
        {
            PasswordsDoNotMatch => TypedResults.Unauthorized(),
            EmailDoesNotExist(var email) => TypedResults.Conflict(
                $"Email address {email} does not exist"
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
    JwtTokenProvider tokenProvider
)
{
    private readonly AppDbContext _context = context;
    private readonly JwtTokenProvider _tokenProvider = tokenProvider;

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
            return new EmailDoesNotExist(command.Email);
        }

        var hashedPassword = PasswordHasher.HashPassword(command.Password);
        var passwordVerificationResult = PasswordHasher.VerifyHashedPassword(
            hashedPassword,
            userInfo.Password
        );

        if (passwordVerificationResult == PasswordVerificationResult.Failed)
        {
            return new PasswordsDoNotMatch();
        }

        var token = _tokenProvider.GenerateToken(userInfo.Id);

        return new LoginSuccessful(new LoginUserResponse { Token = token });
    }
}
