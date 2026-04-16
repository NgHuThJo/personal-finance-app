using System.ComponentModel.DataAnnotations;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public record GetAllBudgetsResponse
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [Range(0, double.MaxValue)]
    public required decimal Maximum { get; init; }

    public required Category Category { get; init; }
    public required ThemeColor ThemeColor { get; init; }
}

public static class GetAllBudgetsEndpoint
{
    public static async Task<Ok<List<GetAllBudgetsResponse>>> GetAllBudgets(
        [FromServices] CurrentUser user,
        [FromServices] GetAllBudgetsHandler handler,
        CancellationToken ct
    )
    {
        var budgets = await handler.Handle(user.UserId, ct);

        return TypedResults.Ok(budgets);
    }
}

public class GetAllBudgetsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetAllBudgetsResponse>> Handle(
        int userId,
        CancellationToken ct
    )
    {
        var budgets = await _context
            .Budgets.Where(b => b.UserId == userId)
            .Select(b => new GetAllBudgetsResponse
            {
                Category = b.Category,
                Id = b.Id,
                Maximum = b.Maximum,
                ThemeColor = b.ThemeColor,
            })
            .AsNoTracking()
            .ToListAsync(ct);

        return budgets;
    }
}
