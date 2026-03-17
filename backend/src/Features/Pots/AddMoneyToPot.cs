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
        Message = "Pot with ID {PotId} does not exist with"
    )]
    public static partial void PotDoesNotExist(ILogger logger, int potId);
}

public abstract record AddMoneyToPotResult;

public record PotDoesNotExist(int PotId) : AddMoneyToPotResult;

public record MoneySuccessfullyAdded() : AddMoneyToPotResult;

public record AddMoneyToPotRequest
{
    public required decimal MoneyAdded { get; set; }
}

public class AddMoneyToPotValidator : AbstractValidator<AddMoneyToPotRequest>
{
    public AddMoneyToPotValidator()
    {
        RuleFor(a => a.MoneyAdded).GreaterThanOrEqualTo(0);
    }
}

public static class AddMoneyToPotEndpoint
{
    public static async Task<
        Results<ProblemHttpResult, NoContent>
    > AddMoneyToPot(
        [FromRoute] int potId,
        AddMoneyToPotRequest command,
        [FromServices] AddMoneyToPotHandler handler
    )
    {
        var result = await handler.Handle(command, potId);

        return result switch
        {
            MoneySuccessfullyAdded => TypedResults.NoContent(),
            PotDoesNotExist(int nonExistentPotId) =>
                TypedResultsProblemDetails.UnprocessableContent(
                    $"Pot does not exist with id {nonExistentPotId}"
                ),
            _ => throw new NotSupportedException(
                $"An unknown error occurred in {nameof(AddMoneyToPot)}"
            ),
        };
    }
}

public class AddMoneyToPotHandler(
    AppDbContext context,
    ILogger<AddMoneyToPotHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<AddMoneyToPotHandler> _logger = logger;

    public async Task<AddMoneyToPotResult> Handle(
        AddMoneyToPotRequest command,
        int potId
    )
    {
        var pot = await _context
            .Pots.Where(p => p.Id == potId)
            .SingleOrDefaultAsync();

        if (pot is null)
        {
            AddMoneyToPotLogger.PotDoesNotExist(_logger, potId);
            return new PotDoesNotExist(potId);
        }

        var newTotal = pot.Target + command.MoneyAdded;
        pot.Total = pot.Target < newTotal ? pot.Target : newTotal;

        await _context.SaveChangesAsync();

        return new MoneySuccessfullyAdded();
    }
}
