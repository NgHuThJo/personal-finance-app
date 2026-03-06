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
    [Range(0, int.MaxValue)]
    public required int PotId { get; init; }

    [Range(0, double.MaxValue)]
    public required decimal MoneyWithdrawn { get; init; }
}

public class WithdrawMoneyFromPotValidator
    : AbstractValidator<WithdrawMoneyFromPotRequest>
{
    public WithdrawMoneyFromPotValidator()
    {
        RuleFor(m => m.PotId).GreaterThan(0);
        RuleFor(m => m.MoneyWithdrawn).GreaterThan(0);
    }
}

public static class WithdrawMoneyFromPotEndpoint
{
    public static async Task<Results<ProblemHttpResult, NoContent>> Withdraw(
        [FromBody] WithdrawMoneyFromPotRequest command,
        [FromServices] WithdrawMoneyFromPotHandler handler
    )
    {
        var result = await handler.Handle(command);

        return result switch
        {
            PotNotFound(int potId) =>
                TypedResultsProblemDetails.UnprocessableContent(
                    $"PotId {potId} not found"
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
        WithdrawMoneyFromPotRequest command
    )
    {
        var pot = await _context
            .Pots.Where(p => p.Id == command.PotId)
            .FirstOrDefaultAsync();

        if (pot is null)
        {
            WithdrawMoneyFromPotLogger.PotIdDoesNotExist(
                _logger,
                command.PotId
            );
            return new PotNotFound(command.PotId);
        }

        var newPotTotal = pot.Total - command.MoneyWithdrawn;

        pot.Total = newPotTotal < 0 ? 0 : newPotTotal;

        _context.Update(pot);
        await _context.SaveChangesAsync();

        return new MoneyWithdrawn();
    }
}
