using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Numerics;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public abstract record GetUserResult;

public record UserCreated(CreateUserResponse User) : GetUserResult;

public record EmailAlreadyInUse(string Email) : GetUserResult;

public record CreateUserRequest
{
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public required string Email { get; init; }

    [MinLength(8, ErrorMessage = "Password has minimum length of 8 characters")]
    public required string Password { get; init; }
}

public record CreateUserResponse
{
    [Range(0, int.MaxValue)]
    public required int Id { get; init; }

    [EmailAddress]
    public required string Email { get; init; }
}

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(u => u.Email).NotEmpty().EmailAddress();
        RuleFor(u => u.Password).NotEmpty().MinimumLength(8);
    }
}

public sealed class CreateUserEndpoint
{
    public static async Task<
        Results<Created<CreateUserResponse>, Conflict<string>>
    > Create(
        [FromServices] CreateUserHandler handler,
        [FromBody] CreateUserRequest command
    )
    {
        var newUser = await handler.Handle(command);

        return newUser switch
        {
            UserCreated(var user) => TypedResults.Created(
                $"/api/users/{user.Id}",
                user
            ),
            EmailAlreadyInUse(var email) => TypedResults.Conflict(
                $"Email address \"{email}\" is already in use"
            ),
            _ => throw new NotSupportedException(
                "An unknown error has occurred in CreateUser endpoint"
            ),
        };
    }
}

public sealed class CreateUserHandler(
    AppDbContext context,
    ILogger<CreateUserHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<CreateUserHandler> _logger = logger;

    public async Task<GetUserResult> Handle(CreateUserRequest command)
    {
        var emailLower = command.Email.ToLower();
        var isEmailNotAvailable = await _context
            .Users.Where(u => u.Email.ToLower() == emailLower)
            .AnyAsync(u => u.Email.ToLower() == emailLower);

        if (isEmailNotAvailable)
        {
            Log.LogEmailOfUser(_logger, command.Email);
            return new EmailAlreadyInUse(command.Email);
        }

        var hashedPassword = PasswordHasher.HashPassword(command.Password);
        var newUser = new User
        {
            Email = command.Email,
            Password = hashedPassword,
            Balance = new Balance(),
        };
        _context.Users.Add(newUser);

        await _context.SaveChangesAsync();

        return new UserCreated(
            new CreateUserResponse { Id = newUser.Id, Email = newUser.Email }
        );
    }
}
