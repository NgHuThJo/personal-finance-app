using System.ComponentModel.DataAnnotations;
using System.Data;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public abstract record GetUserByIdResult;

public record UserFound(GetUserByIdResponse User) : GetUserByIdResult;

public record UserNotFound(int Id) : GetUserByIdResult;

public record GetUserByIdResponse
{
    [Range(0, int.MaxValue)]
    public required int Id { get; init; }

    [EmailAddress]
    public required string Email { get; init; }

    [MinLength(1)]
    public required string? Name { get; init; } = null;
}

public sealed class GetUserByIdEndpoint
{
    public static async Task<
        Results<Ok<GetUserByIdResponse>, NotFound<string>>
    > GetById([FromRoute] int userId, [FromServices] GetUserByIdHandler handler)
    {
        var foundUser = await handler.Handle(userId);

        return foundUser switch
        {
            UserFound(var user) => TypedResults.Ok(user),
            UserNotFound(var id) => TypedResults.NotFound(
                $"UserId \"{id}\" does not exist"
            ),
            _ => throw new NotSupportedException(
                "An unknown error has occurred in GetUserById endpoint"
            ),
        };
    }
}

public sealed class GetUserByIdHandler(
    AppDbContext context,
    ILogger<GetUserByIdHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<GetUserByIdHandler> _logger = logger;

    public async Task<GetUserByIdResult> Handle(int userId)
    {
        var user = await _context
            .Users.Where(u => u.Id == userId)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (user is null)
        {
            Logger.LogUserIdNotFound(_logger, userId);
            return new UserNotFound(userId);
        }

        return new UserFound(
            new GetUserByIdResponse
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
            }
        );
    }
}
