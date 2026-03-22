using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public static partial class DeletePotLogger
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
}

public static class DeletePotEndpoint
{
    public static async Task<Results<ProblemHttpResult, NoContent>> DeletePot(
        [FromRoute] int potId,
        [FromServices] CurrentUser user,
        [FromServices] DeletePotHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.Handle(potId, user.UserId, ct);

        return result.Match<Results<ProblemHttpResult, NoContent>>(
            _ => TypedResults.NoContent(),
            error =>
                error switch
                {
                    PotError.PotNotFound(int nonExistentPotId) =>
                        TypedResultsProblemDetails.UnprocessableContent(
                            $"Pot does not exist with ID {nonExistentPotId}"
                        ),
                    PotError.BalanceNotFound(int nonExistentUserId) =>
                        TypedResultsProblemDetails.UnprocessableContent(
                            $"Balance of user with ID  {nonExistentUserId}"
                        ),
                    _ => throw new NotSupportedException(
                        $"An unknown error occurred in {nameof(DeletePot)}"
                    ),
                }
        );
    }
}

public class DeletePotHandler(
    AppDbContext context,
    ILogger<DeletePotHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<DeletePotHandler> _logger = logger;

    public async Task<Result<Unit, PotError>> Handle(
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
            DeletePotLogger.PotDoesNotExist(_logger, potId);
            return Result<Unit, PotError>.Fail(new PotError.PotNotFound(potId));
        }

        if (balance is null)
        {
            DeletePotLogger.BalanceDoesNotExist(_logger, userId);
            return Result<Unit, PotError>.Fail(
                new PotError.BalanceNotFound(userId)
            );
        }

        var state = PotState.From(pot, balance);

        var result = PotExtensions.TransferDepositToBalance(state);

        var newState = result.Value;

        balance.Current = newState.BalanceCurrent;
        _context.Pots.Remove(pot);

        await _context.SaveChangesAsync(ct);

        return Result<Unit, PotError>.Ok(Unit.Value);
    }
}
