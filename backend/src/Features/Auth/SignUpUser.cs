using System.ComponentModel.DataAnnotations;
using System.Data;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public abstract record SignUpUserResult;

public record SignupSuccessful(SignUpUserResponse User) : SignUpUserResult;

public record EmailAlreadyInUse(string Email) : SignUpUserResult;

public record SignUpUserRequest
{
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public required string Email { get; init; }

    [MinLength(8, ErrorMessage = "Password has minimum length of 8 characters")]
    public required string Password { get; init; }

    [MinLength(1)]
    public required string Name { get; init; }
}

public record SignUpUserResponse
{
    [Range(0, int.MaxValue)]
    public required int Id { get; init; }

    [EmailAddress]
    public required string Email { get; init; }

    [MinLength(1)]
    public required string Name { get; init; }
}

public class SignUpUserRequestValidator : AbstractValidator<SignUpUserRequest>
{
    public SignUpUserRequestValidator()
    {
        RuleFor(u => u.Email).NotEmpty().EmailAddress();
        RuleFor(u => u.Password).NotEmpty().MinimumLength(8);
        RuleFor(u => u.Name).NotEmpty();
    }
}

public sealed class SignUpUserEndpoint
{
    public static async Task<
        Results<Created<SignUpUserResponse>, ProblemHttpResult>
    > Create(
        [FromServices] SignUpUserHandler handler,
        [FromBody] SignUpUserRequest command
    )
    {
        var newUser = await handler.Handle(command);

        return newUser switch
        {
            SignupSuccessful(var user) => TypedResults.Created(
                $"/api/users/{user.Id}",
                user
            ),
            EmailAlreadyInUse(var email) => TypedResultsProblemDetails.Conflict(
                $"Email address \"{email}\" is already in use"
            ),
            _ => throw new NotSupportedException(
                "An unknown error has occurred in SignUpUser endpoint"
            ),
        };
    }
}

public sealed class SignUpUserHandler(
    AppDbContext context,
    ILogger<SignUpUserHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<SignUpUserHandler> _logger = logger;

    public async Task<SignUpUserResult> Handle(SignUpUserRequest command)
    {
        var emailLower = command.Email.ToLower();
        var isEmailNotAvailable = await _context
            .Users.Where(u => u.Email.ToLower() == emailLower)
            .AnyAsync(u => u.Email.ToLower() == emailLower);

        if (isEmailNotAvailable)
        {
            Logger.LogEmailOfUser(_logger, command.Email);
            return new EmailAlreadyInUse(command.Email);
        }

        var hashedPassword = PasswordHasher.HashPassword(command.Password);
        var newUser = new User
        {
            Email = command.Email,
            Password = hashedPassword,
            Name = command.Name,
            Balance = new Balance(),
        };
        _context.Users.Add(newUser);

        await _context.SaveChangesAsync();

        return new SignupSuccessful(
            new SignUpUserResponse
            {
                Id = newUser.Id,
                Email = newUser.Email,
                Name = newUser.Name,
            }
        );
    }
}
