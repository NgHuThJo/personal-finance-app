using System.ComponentModel.DataAnnotations;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public static partial class WithdrawMoneyFromPotLogger
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Pot with ID {PotId} does not exist"
    )]
    public static partial void PotDoesNotExist(ILogger logger, int potId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Balance of user with ID {UserId} does not exist"
    )]
    public static partial void BalanceDoesNotExist(ILogger logger, int userId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Insufficient funds to withdraw from pot"
    )]
    public static partial void InsufficientFunds(ILogger logger);
}

public abstract record WithdrawMoneyFromPotResult
{
    public record PotNotFound(int PotId) : WithdrawMoneyFromPotResult;

    public record BalanceNotFound(int UserId) : WithdrawMoneyFromPotResult;

    public record InsufficientFunds : WithdrawMoneyFromPotResult;

    public record NegativeAmount : WithdrawMoneyFromPotResult;

    public record Success : WithdrawMoneyFromPotResult;
}

public record WithdrawMoneyFromPotRequest
{
    [Range(0, double.MaxValue)]
    public required decimal WithdrawAmount { get; init; }
}

public class WithdrawMoneyFromPotValidator
    : AbstractValidator<WithdrawMoneyFromPotRequest>
{
    public WithdrawMoneyFromPotValidator()
    {
        RuleFor(m => m.WithdrawAmount).GreaterThan(0);
    }
}

public static class WithdrawMoneyFromPotEndpoint
{
    public static async Task<
        Results<ProblemHttpResult, NoContent>
    > WithdrawMoneyFromPot(
        [FromRoute] int potId,
        [FromServices] CurrentUser user,
        [FromBody] WithdrawMoneyFromPotRequest command,
        [FromServices] WithdrawMoneyFromPotHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.Handle(command, potId, user.UserId, ct);

        return result switch
        {
            WithdrawMoneyFromPotResult.PotNotFound(int notFoundPotId) =>
                TypedResultsProblemDetails.UnprocessableContent(
                    $"Pot with ID {notFoundPotId} not found"
                ),
            WithdrawMoneyFromPotResult.BalanceNotFound(int notFoundUserId) =>
                TypedResultsProblemDetails.UnprocessableContent(
                    $"No balance of user with ID {notFoundUserId} found"
                ),
            WithdrawMoneyFromPotResult.NegativeAmount =>
                TypedResultsProblemDetails.UnprocessableContent(
                    "Amount must not be negative"
                ),
            WithdrawMoneyFromPotResult.InsufficientFunds =>
                TypedResultsProblemDetails.UnprocessableContent(
                    "Insufficient funds"
                ),
            WithdrawMoneyFromPotResult.Success => TypedResults.NoContent(),
            _ => throw new NotSupportedException(),
        };
    }
}

public class WithdrawMoneyFromPotHandler(
    AppDbContext context,
    ILogger<WithdrawMoneyFromPotHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<WithdrawMoneyFromPotHandler> _logger = logger;

    public async Task<WithdrawMoneyFromPotResult> Handle(
        WithdrawMoneyFromPotRequest command,
        int potId,
        int userId,
        CancellationToken ct = default
    )
    {
        // Start transaction
        await using var transaction =
            await _context.Database.BeginTransactionAsync(ct);

        var potTask = _context
            .Pots.Where(p => p.Id == potId && p.UserId == userId)
            .FirstOrDefaultAsync(ct);
        var balanceTask = _context
            .Balances.Where(b => b.UserId == userId)
            .FirstOrDefaultAsync(ct);

        await Task.WhenAll(potTask, balanceTask);

        var pot = potTask.Result;
        var balance = balanceTask.Result;

        if (pot is null)
        {
            WithdrawMoneyFromPotLogger.PotDoesNotExist(_logger, potId);
            return new WithdrawMoneyFromPotResult.PotNotFound(potId);
        }

        if (balance is null)
        {
            WithdrawMoneyFromPotLogger.BalanceDoesNotExist(_logger, userId);
            return new WithdrawMoneyFromPotResult.BalanceNotFound(userId);
        }

        var withdrawalResult = PotsExtensions.WithdrawMoney(
            balance.Current,
            pot.Total,
            command.WithdrawAmount
        );

        if (!withdrawalResult.IsSuccess)
        {
            return withdrawalResult.Error switch
            {
                PotsError.NegativeAmount =>
                    new WithdrawMoneyFromPotResult.NegativeAmount(),
                PotsError.InsufficientFunds =>
                    new WithdrawMoneyFromPotResult.InsufficientFunds(),
                _ => throw new InvalidOperationException("Invalid withdrawal"),
            };
        }

        var (newBalance, newPotTotal) = withdrawalResult.Value;
        balance.Current = newBalance;
        pot.Total = newPotTotal;
        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new WithdrawMoneyFromPotResult.Success();
    }
}
