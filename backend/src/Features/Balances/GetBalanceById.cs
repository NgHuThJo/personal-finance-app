using backend.Models;
using backend.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public static partial class GetBalanceByIdLogger
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Balance with User{Id} does not exist"
    )]
    public static partial void LogBalanceNotFound(ILogger logger, int id);
}

public abstract record GetBalanceByIdResult;

public record BalanceNotFound : GetBalanceByIdResult
{
    public required int Id { get; init; }
};

public record BalanceFound : GetBalanceByIdResult
{
    public required GetBalanceByIdResponse Balance { get; init; }
}

public record GetBalanceByIdResponse
{
    public required decimal Current { get; init; }
    public required decimal Income { get; init; }
    public required decimal Expense { get; init; }
}

public static class GetBalanceByIdEndpoint
{
    public static async Task<
        Results<ProblemHttpResult, Ok<GetBalanceByIdResponse>>
    > Get(
        [FromServices] CurrentUser user,
        [FromServices] GetBalanceByIdHandler handler
    )
    {
        var newBalance = await handler.Handle(user.UserId);

        return newBalance switch
        {
            BalanceNotFound => TypedResultsProblemDetails.Unauthorized(
                "Balance not found"
            ),
            BalanceFound { Balance: var balance } => TypedResults.Ok(balance),
            _ => throw new NotSupportedException(),
        };
    }
}

public class GetBalanceByIdHandler(
    AppDbContext context,
    ILogger<GetBalanceByIdHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<GetBalanceByIdHandler> _logger = logger;

    public async Task<GetBalanceByIdResult> Handle(int userId)
    {
        var balance = await _context
            .Balances.Where(b => b.UserId == userId)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (balance is null)
        {
            GetBalanceByIdLogger.LogBalanceNotFound(_logger, userId);
            return new BalanceNotFound { Id = userId };
        }

        return new BalanceFound
        {
            Balance = new GetBalanceByIdResponse
            {
                Current = balance.Current,
                Income = balance.Income,
                Expense = balance.Expense,
            },
        };
    }
}
