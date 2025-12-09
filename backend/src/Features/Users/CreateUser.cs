using System.ComponentModel.DataAnnotations;
using System.Data;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public record CreateUserRequest
{
    [EmailAddress]
    public required string Email { get; init; }
    public required string Password { get; init; }
}

public record CreateUserResponse
{
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

public static class CreateUserEndpoint
{
    public static async Task<Created<CreateUserResponse>> Create(
        [FromServices] CreateUserHandler handler,
        [FromBody] CreateUserRequest command
    )
    {
        var newUser = await handler.Handle(command);

        return TypedResults.Created($"/api/users/{newUser.Id}", newUser);
    }
}

public class CreateUserHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<CreateUserResponse> Handle(CreateUserRequest command)
    {
        var isEmailNotAvailable = await _context
            .Users.Where(u => u.Email == command.Email)
            .AnyAsync(u =>
                u.Email.Equals(
                    command.Email,
                    StringComparison.OrdinalIgnoreCase
                )
            );

        if (isEmailNotAvailable)
        {
            throw new DuplicateNameException(
                $"Email address \"{command.Email}\" is already in use"
            );
        }

        var hashedPassword = PasswordHasher.HashPassword(command.Password);
        var newUser = new User
        {
            Email = command.Email,
            Password = hashedPassword,
            Balance = new Balance(),
        };

        await _context.SaveChangesAsync();

        return new CreateUserResponse
        {
            Id = newUser.Id,
            Email = newUser.Email,
        };
    }
}
