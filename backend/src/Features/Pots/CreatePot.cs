using System.ComponentModel.DataAnnotations;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public abstract record CreatePotResult;

public record PotNameAlreadyInUse(string PotName) : CreatePotResult;

public record PotSuccessfullyCreated() : CreatePotResult;

public static partial class CreatePotLogger
{
    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Pot name {PotName} is already in use"
    )]
    public static partial void PotNameAlreadyInUse(
        ILogger logger,
        string potName
    );
}

public record CreatePotRequest
{
    [Range(0, double.MaxValue)]
    public required decimal Target { get; init; }

    [MinLength(1)]
    public required string Name { get; init; }
}

public class CreatePotValidator : AbstractValidator<CreatePotRequest>
{
    public CreatePotValidator()
    {
        RuleFor(p => p.Target).GreaterThanOrEqualTo(0);
        RuleFor(p => p.Name).MinimumLength(1);
    }
}

public sealed class CreatePotEndpoint
{
    public static async Task<Results<Created, ProblemHttpResult>> CreatePot(
        [FromBody] CreatePotRequest command,
        [FromServices] CurrentUser user,
        [FromServices] CreatePotHandler handler,
        CancellationToken ct
    )
    {
        var newPot = await handler.Handle(command, user.UserId, ct);

        return newPot switch
        {
            PotSuccessfullyCreated => TypedResults.Created(),
            PotNameAlreadyInUse(string potName) =>
                TypedResultsProblemDetails.Conflict(
                    $"Pot name {potName} is already in use"
                ),
            _ => throw new NotSupportedException(
                $"An unknown error occurred in {nameof(CreatePotEndpoint)}"
            ),
        };
    }
}

public class CreatePotHandler(
    AppDbContext context,
    ILogger<CreatePotHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<CreatePotHandler> _logger = logger;

    public async Task<CreatePotResult> Handle(
        CreatePotRequest command,
        int userId,
        CancellationToken ct
    )
    {
        var usedPotName = await _context
            .Pots.Where(p => p.Name == command.Name)
            .Select(p => p.Name)
            .SingleOrDefaultAsync(ct);

        if (usedPotName is not null)
        {
            CreatePotLogger.PotNameAlreadyInUse(_logger, usedPotName);
            return new PotNameAlreadyInUse(usedPotName);
        }

        var newPot = new Pot
        {
            Target = command.Target,
            Name = command.Name,
            UserId = userId,
        };

        _context.Pots.Add(newPot);

        await _context.SaveChangesAsync(ct);

        return new PotSuccessfullyCreated();
    }
}
