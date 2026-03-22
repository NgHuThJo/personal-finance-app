using backend.Src.Models;
using backend.Src.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public static partial class GetBalanceByUserIdLogger
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Balance with UserId {Id} does not exist"
    )]
    public static partial void BalanceDoesNotExist(ILogger logger, int id);
}

public record GetBalanceByUserIdResponse
{
    public required decimal Current { get; init; }
    public required decimal Income { get; init; }
    public required decimal Expense { get; init; }
}

public static class GetBalanceByUserIdEndpoint
{
    public static async Task<
        Results<ProblemHttpResult, Ok<GetBalanceByUserIdResponse>>
    > GetBalanceByUserId(
        [FromServices] CurrentUser user,
        [FromServices] GetBalanceByUserIdHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.Handle(user.UserId, ct);

        return result.Match<
            Results<ProblemHttpResult, Ok<GetBalanceByUserIdResponse>>
        >(
            success => TypedResults.Ok(success),
            error =>
                error switch
                {
                    BalanceError.BalanceNotFound =>
                        TypedResultsProblemDetails.Unauthorized(
                            "Balance not found"
                        ),
                    _ => throw new NotSupportedException(),
                }
        );
    }
}

public class GetBalanceByUserIdHandler(
    AppDbContext context,
    ILogger<GetBalanceByUserIdHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<GetBalanceByUserIdHandler> _logger = logger;

    public async Task<Result<GetBalanceByUserIdResponse, BalanceError>> Handle(
        int userId,
        CancellationToken ct
    )
    {
        var balance = await _context
            .Balances.Where(b => b.UserId == userId)
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);

        if (balance is null)
        {
            GetBalanceByUserIdLogger.BalanceDoesNotExist(_logger, userId);
            return Result<GetBalanceByUserIdResponse, BalanceError>.Fail(
                new BalanceError.BalanceNotFound(userId)
            );
        }

        return Result<GetBalanceByUserIdResponse, BalanceError>.Ok(
            new GetBalanceByUserIdResponse
            {
                Current = balance.Current,
                Income = balance.Income,
                Expense = balance.Expense,
            }
        );
    }
}
