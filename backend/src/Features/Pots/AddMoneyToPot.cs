using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public static partial class AddMoneyToPotLogger
{
    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Pot with ID {PotId} does not exist"
    )]
    public static partial void PotDoesNotExist(ILogger logger, int potId);

    [LoggerMessage(
        Level = LogLevel.Information,
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

public record AddMoneyToPotRequest
{
    public required decimal AddAmount { get; set; }
}

public class AddMoneyToPotValidator : AbstractValidator<AddMoneyToPotRequest>
{
    public AddMoneyToPotValidator()
    {
        RuleFor(a => a.AddAmount).GreaterThanOrEqualTo(0);
    }
}

public static class AddMoneyToPotEndpoint
{
    public static async Task<
        Results<ProblemHttpResult, NoContent>
    > AddMoneyToPot(
        [FromRoute] int potId,
        [FromServices] CurrentUser user,
        [FromServices] AddMoneyToPotHandler handler,
        AddMoneyToPotRequest command
    )
    {
        var result = await handler.Handle(command, potId, user.UserId);

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
                    PotError.InsufficientFunds =>
                        TypedResultsProblemDetails.UnprocessableContent(
                            "Insufficient funds"
                        ),
                    _ => throw new NotSupportedException(
                        $"An unknown error occurred in {nameof(AddMoneyToPot)}"
                    ),
                }
        );
    }
}

public class AddMoneyToPotHandler(
    AppDbContext context,
    ILogger<AddMoneyToPotHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<AddMoneyToPotHandler> _logger = logger;

    public async Task<Result<Unit, PotError>> Handle(
        AddMoneyToPotRequest command,
        int potId,
        int userId
    )
    {
        var pot = await _context
            .Pots.Where(p => p.Id == potId)
            .SingleOrDefaultAsync();
        var balance = await _context
            .Balances.Where(b => b.UserId == userId)
            .SingleOrDefaultAsync();

        if (pot is null)
        {
            AddMoneyToPotLogger.PotDoesNotExist(_logger, potId);
            return Result<Unit, PotError>.Fail(new PotError.PotNotFound(potId));
        }

        if (balance is null)
        {
            AddMoneyToPotLogger.BalanceDoesNotExist(_logger, userId);
            return Result<Unit, PotError>.Fail(
                new PotError.BalanceNotFound(userId)
            );
        }

        var state = new PotState
        {
            BalanceCurrent = balance.Current,
            PotTotal = pot.Total,
            PotTarget = pot.Target,
        };

        var addMoneyResult = PotExtensions.DepositToPot(
            state,
            command.AddAmount
        );

        if (!addMoneyResult.IsSuccess)
        {
            switch (addMoneyResult.Error)
            {
                case PotError.NegativeAmount:
                {
                    AddMoneyToPotLogger.NegativeAmount(_logger);
                    return Result<Unit, PotError>.Fail(addMoneyResult.Error);
                }

                case PotError.InsufficientFunds:
                {
                    AddMoneyToPotLogger.InsufficientFunds(_logger);
                    return Result<Unit, PotError>.Fail(addMoneyResult.Error);
                }
                default:
                {
                    throw new InvalidOperationException("Invalid withdrawal");
                }
            }
        }

        var newState = addMoneyResult.Value;

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        balance.Current = newState.BalanceCurrent;
        pot.Total = newState.PotTotal;
        await _context.SaveChangesAsync();

        await transaction.CommitAsync();

        return Result<Unit, PotError>.Ok(Unit.Value);
    }
}
