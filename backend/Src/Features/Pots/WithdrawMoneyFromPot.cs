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
        Level = LogLevel.Warning,
        Message = "Pot with ID {PotId} does not exist"
    )]
    public static partial void PotDoesNotExist(ILogger logger, int potId);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Balance of user with ID {UserId} does not exist"
    )]
    public static partial void BalanceDoesNotExist(ILogger logger, int userId);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Amount cannot be negative"
    )]
    public static partial void NegativeAmount(ILogger logger);

    [LoggerMessage(
        Level = LogLevel.Warning,
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
        RuleFor(m => m.WithdrawAmount)
            .GreaterThan(0)
            .PrecisionScale(14, 2, true);
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
            WithdrawMoneyFromPotResult.Success => TypedResults.NoContent(),
            WithdrawMoneyFromPotResult.PotNotFound(int notFoundPotId) =>
                TypedResultsProblemDetails.UnprocessableContent(
                    $"No pot with ID {notFoundPotId} not found"
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
            _ => throw new NotSupportedException(
                $"An unknown error occurred in {nameof(WithdrawMoneyFromPot)}"
            ),
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
        var pot = await _context
            .Pots.Where(p => p.Id == potId && p.UserId == userId)
            .FirstOrDefaultAsync(ct);
        var balance = await _context
            .Balances.Where(b => b.UserId == userId)
            .FirstOrDefaultAsync(ct);

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

        var potState = PotState.From(pot, balance);

        var draftResult = PotExtensions.DraftFromPot(
            potState,
            command.WithdrawAmount
        );

        if (!draftResult.IsSuccess)
        {
            switch (draftResult.Error)
            {
                case PotError.NegativeAmount:
                {
                    WithdrawMoneyFromPotLogger.NegativeAmount(_logger);
                    return new WithdrawMoneyFromPotResult.NegativeAmount();
                }

                case PotError.InsufficientFunds:
                {
                    WithdrawMoneyFromPotLogger.InsufficientFunds(_logger);
                    return new WithdrawMoneyFromPotResult.InsufficientFunds();
                }
                default:
                {
                    throw new InvalidOperationException("Invalid withdrawal");
                }
            }
            ;
        }

        var newState = draftResult.Value;
        balance.Current = newState.BalanceCurrent;
        pot.Total = newState.PotTotal;
        await _context.SaveChangesAsync(ct);

        return new WithdrawMoneyFromPotResult.Success();
    }
}
