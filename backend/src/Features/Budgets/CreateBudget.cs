using System.ComponentModel.DataAnnotations;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Src.Features;

public record CreateBudgetRequest
{
    [Range(0, double.MaxValue)]
    public required decimal Maximum { get; init; }
    public required Category Category { get; init; }
}

public class CreateBudgetValidator : AbstractValidator<CreateBudgetRequest>
{
    public CreateBudgetValidator()
    {
        RuleFor(b => b.Maximum)
            .GreaterThanOrEqualTo(0)
            .PrecisionScale(14, 2, true);
        RuleFor(b => b.Category).IsInEnum();
    }
}

public static class CreateBudgetEndpoint
{
    public static async Task<Created> CreateBudget(
        [FromBody] CreateBudgetRequest request,
        [FromServices] CurrentUser user,
        [FromServices] CreateBudgetHandler handler,
        CancellationToken ct
    )
    {
        await handler.Handle(request, user.UserId, ct);

        return TypedResults.Created();
    }
}

public class CreateBudgetHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(
        CreateBudgetRequest command,
        int userId,
        CancellationToken ct
    )
    {
        var newBudget = new Budget
        {
            Category = command.Category,
            Maximum = command.Maximum,
            UserId = userId,
        };
        _context.Budgets.Add(newBudget);

        await _context.SaveChangesAsync(ct);
    }
}
