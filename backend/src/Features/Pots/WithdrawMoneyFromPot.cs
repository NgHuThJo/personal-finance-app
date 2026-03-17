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
        Message = "PotId {PotId} does not exist"
    )]
    public static partial void PotIdDoesNotExist(ILogger logger, int potId);
}

public abstract record WithdrawMoneyFromPotResult;

public record PotNotFound(int PotId) : WithdrawMoneyFromPotResult;

public record MoneyWithdrawn : WithdrawMoneyFromPotResult;

public record WithdrawMoneyFromPotRequest
{
    [Range(0, double.MaxValue)]
    public required decimal MoneyWithdrawn { get; init; }
}

public class WithdrawMoneyFromPotValidator
    : AbstractValidator<WithdrawMoneyFromPotRequest>
{
    public WithdrawMoneyFromPotValidator()
    {
        RuleFor(m => m.MoneyWithdrawn).GreaterThan(0);
    }
}

public static class WithdrawMoneyFromPotEndpoint
{
    public static async Task<
        Results<ProblemHttpResult, NoContent>
    > WithdrawMoneyFromPot(
        [FromRoute] int potId,
        [FromBody] WithdrawMoneyFromPotRequest command,
        [FromServices] WithdrawMoneyFromPotHandler handler
    )
    {
        var result = await handler.Handle(command, potId);

        return result switch
        {
            PotNotFound(int notFoundPotId) =>
                TypedResultsProblemDetails.UnprocessableContent(
                    $"PotId {notFoundPotId} not found"
                ),
            MoneyWithdrawn => TypedResults.NoContent(),
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
        int potId
    )
    {
        var pot = await _context
            .Pots.Where(p => p.Id == potId)
            .FirstOrDefaultAsync();

        if (pot is null)
        {
            WithdrawMoneyFromPotLogger.PotIdDoesNotExist(_logger, potId);
            return new PotNotFound(potId);
        }

        var newPotTotal = pot.Total - command.MoneyWithdrawn;

        pot.Total = newPotTotal < 0 ? 0 : newPotTotal;

        _context.Update(pot);
        await _context.SaveChangesAsync();

        return new MoneyWithdrawn();
    }
}
