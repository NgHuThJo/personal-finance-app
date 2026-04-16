using System.ComponentModel.DataAnnotations;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public static partial class EditBudgetLogger
{
    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Budget with ID {BudgetId} does not exist"
    )]
    public static partial void BudgetDoesNotExist(ILogger logger, int budgetId);
}

public record EditBudgetRequest
{
    public required Category Category { get; init; }

    [Range(0, double.MaxValue)]
    public required decimal Maximum { get; init; }
    public required ThemeColor ThemeColor { get; init; }
}

public class EditBudgetValidator : AbstractValidator<EditBudgetRequest>
{
    public EditBudgetValidator()
    {
        RuleFor(b => b.Maximum).GreaterThan(0).PrecisionScale(14, 2, true);
        RuleFor(b => b.Category).IsInEnum();
        RuleFor(b => b.ThemeColor).IsInEnum();
    }
}

public static class EditBudgetEndpoint
{
    public static async Task<Results<NoContent, ProblemHttpResult>> EditBudget(
        [FromRoute] int budgetId,
        [FromBody] EditBudgetRequest command,
        [FromServices] CurrentUser user,
        [FromServices] EditBudgetHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.Handle(command, budgetId, user.UserId, ct);

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
                        $"An unknown error occurred in {nameof(EditBudget)}"
                    ),
                }
        );
    }
}

public class EditBudgetHandler(
    AppDbContext context,
    ILogger<EditBudgetHandler> logger
)
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<EditBudgetHandler> _logger = logger;

    public async Task<Result<Unit, BudgetError>> Handle(
        EditBudgetRequest command,
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
            EditBudgetLogger.BudgetDoesNotExist(_logger, budgetId);
            return Result<Unit, BudgetError>.Fail(
                new BudgetError.BudgetDoesNotExist(budgetId)
            );
        }

        budget.Maximum = command.Maximum;
        budget.Category = command.Category;
        budget.ThemeColor = command.ThemeColor;

        await _context.SaveChangesAsync(ct);

        return Result<Unit, BudgetError>.Ok(Unit.Value);
    }
}
