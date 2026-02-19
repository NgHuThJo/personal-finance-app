using System.ComponentModel.DataAnnotations;
using System.Data;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public static partial class GetUserByIdLogger
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "UserId {Id} does not exist"
    )]
    public static partial void UserIdNotFound(ILogger logger, int id);
}

public abstract record GetUserByIdResult;

public record UserFound(GetUserByIdResponse User) : GetUserByIdResult;

public record UserNotFound(int Id) : GetUserByIdResult;

public record GetUserByIdResponse
{
    [EmailAddress]
    public required string Email { get; init; }

    [MinLength(1)]
    public required string Name { get; init; }
}

public sealed class GetUserByIdEndpoint
{
    public static async Task<
        Results<Ok<GetUserByIdResponse>, ProblemHttpResult>
    > GetById(
        [FromServices] CurrentUser user,
        [FromServices] GetUserByIdHandler handler
    )
    {
        var foundUser = await handler.Handle(user.UserId);

        return foundUser switch
        {
            UserFound(var u) => TypedResults.Ok(u),
            UserNotFound(var id) => TypedResultsProblemDetails.BadRequest(
                $"""UserId {id} does not exist"""
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
            GetUserByIdLogger.UserIdNotFound(_logger, userId);
            return new UserNotFound(userId);
        }

        return new UserFound(
            new GetUserByIdResponse { Email = user.Email, Name = user.Name }
        );
    }
}
