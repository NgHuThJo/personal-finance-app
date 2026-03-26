using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public static partial class EditPotLogger
{
    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Pot with ID {PotId} does not exist"
    )]
    public static partial void PotDoesNotExist(ILogger logger, int potId);

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Balance of user with ID {UserId} does not exist"
    )]
    public static partial void BalanceDoesNotExist(ILogger logger, int userId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Invalid edit in pot with potID {PotId} and userID {UserId}"
    )]
    public static partial void InvalidEdit(
        ILogger logger,
        int potId,
        int userId
    );
}

public record EditPotRequest
{
    public required string PotName { get; set; }
    public required decimal NewTarget { get; set; }
}

public class EditPotValidator : AbstractValidator<EditPotRequest>
{
    public EditPotValidator()
    {
        RuleFor(a => a.PotName).MinimumLength(1);
        RuleFor(a => a.NewTarget)
            .GreaterThanOrEqualTo(0)
            .PrecisionScale(14, 2, true);
    }
}

public static class EditPotEndpoint
{
    public static async Task<Results<ProblemHttpResult, NoContent>> EditPot(
        [FromRoute] int potId,
        [FromServices] CurrentUser user,
        [FromServices] EditPotHandler handler,
        EditPotRequest command,
        CancellationToken ct
    )
    {
        var result = await handler.Handle(command, potId, user.UserId, ct);

        return result.Match<Results<ProblemHttpResult, NoContent>>(
            _ => TypedResults.NoContent(),
            error =>
                error switch
                {
                    PotError.PotNotFound(int nonExistentPotId) =>
                        TypedResultsProblemDetails.UnprocessableContent(
                            $"Pot does not exist with Id {nonExistentPotId}"
                        ),
                    PotError.BalanceNotFound(int nonExistentUserId) =>
                        TypedResultsProblemDetails.UnprocessableContent(
                            $"Balance of user with Id  {nonExistentUserId}"
                        ),
                    PotError.NegativeAmount =>
                        TypedResultsProblemDetails.UnprocessableContent(
                            "Amount cannot be negative"
                        ),
                    PotError.PotNameAlreadyExists =>
                        TypedResultsProblemDetails.Conflict(
                            "Amount cannot be negative"
                        ),
                    _ => throw new NotSupportedException(
                        $"An unknown error occurred in {nameof(EditPot)}"
                    ),
                }
        );
    }
}

public class EditPotHandler(
    AppDbContext context,
    ILogger<EditPotHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<EditPotHandler> _logger = logger;

    public async Task<Result<Unit, PotError>> Handle(
        EditPotRequest command,
        int potId,
        int userId,
        CancellationToken ct
    )
    {
        var pot = await _context
            .Pots.Where(p => p.Id == potId && p.UserId == userId)
            .SingleOrDefaultAsync(ct);
        var balance = await _context
            .Balances.Where(b => b.UserId == userId)
            .SingleOrDefaultAsync(ct);

        if (pot is null)
        {
            EditPotLogger.PotDoesNotExist(_logger, potId);
            return Result<Unit, PotError>.Fail(new PotError.PotNotFound(potId));
        }

        if (balance is null)
        {
            EditPotLogger.BalanceDoesNotExist(_logger, userId);
            return Result<Unit, PotError>.Fail(
                new PotError.BalanceNotFound(userId)
            );
        }

        var state = PotState.From(pot, balance);

        var result = PotExtensions
            .ChangeName(state, command.PotName)
            .Bind(s => PotExtensions.ChangeTarget(s, command.NewTarget));

        if (!result.IsSuccess)
        {
            EditPotLogger.InvalidEdit(_logger, potId, userId);
            return Result<Unit, PotError>.Fail(result.Error);
        }

        var newState = result.Value;

        balance.Current = newState.BalanceCurrent;
        pot.Name = newState.PotName;
        pot.Target = newState.PotTarget;
        pot.Total = newState.PotTotal;
        await _context.SaveChangesAsync(ct);

        return Result<Unit, PotError>.Ok(Unit.Value);
    }
}
