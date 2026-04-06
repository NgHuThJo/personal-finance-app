using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public static partial class DeleteBudgetLogger
{
    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Budget with ID {BudgetId} does not exist"
    )]
    public static partial void BudgetDoesNotExist(ILogger logger, int budgetId);
}

public static class DeleteBudgetEndpoint
{
    public static async Task<
        Results<NoContent, ProblemHttpResult>
    > DeleteBudget(
        [FromRoute] int budgetId,
        [FromServices] CurrentUser user,
        [FromServices] DeleteBudgetHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.Handle(budgetId, user.UserId, ct);

        return result.Match<Results<NoContent, ProblemHttpResult>>(
            s => TypedResults.NoContent(),
            e =>
                e switch
                {
                    BudgetError.BudgetDoesNotExist(int budgetId) =>
                        TypedResultsProblemDetails.Unauthorized(
                            $"Budget with ID {budgetId} does not exist"
                        ),
                    _ => throw new InvalidOperationException(
                        $"An unknown error occurred in {nameof(DeleteBudget)}"
                    ),
                }
        );
    }
}

public class DeleteBudgetHandler(
    AppDbContext context,
    ILogger<DeleteBudgetHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<DeleteBudgetHandler> _logger = logger;

    public async Task<Result<Unit, BudgetError>> Handle(
        int budgetId,
        int userId,
        CancellationToken ct
    )
    {
        var budget = await _context
            .Budgets.Where(b => b.Id == budgetId && b.UserId == userId)
            .FirstOrDefaultAsync(ct);

        if (budget is null)
        {
            DeleteBudgetLogger.BudgetDoesNotExist(_logger, budgetId);
            return Result<Unit, BudgetError>.Fail(
                new BudgetError.BudgetDoesNotExist(budgetId)
            );
        }

        _context.Budgets.Remove(budget);

        await _context.SaveChangesAsync(ct);

        return Result<Unit, BudgetError>.Ok(Unit.Value);
    }
}
