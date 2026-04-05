using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public record GetAllTransactionsUserDto
{
    public required string Name { get; init; }
    public required string Email { get; init; }
}

public record GetAllTransactionsResponse
{
    public required int Id { get; init; }
    public required decimal Amount { get; init; }
    public required DateTimeOffset TransactionDate { get; init; }
    public required bool IsRecurring { get; init; }
    public required Category Category { get; init; }
    public required GetAllTransactionsUserDto User { get; init; }
}

public static class GetAllTransactionsEndpoint
{
    public static async Task<
        Ok<List<GetAllTransactionsResponse>>
    > GetAllTransactions(
        [FromServices] CurrentUser user,
        [FromServices] GetAllTransactionsHandler handler,
        CancellationToken ct
    )
    {
        var transactions = await handler.Handle(user.UserId, ct);

        return TypedResults.Ok(transactions);
    }
}

public class GetAllTransactionsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetAllTransactionsResponse>> Handle(
        int userId,
        CancellationToken ct
    )
    {
        var transactions = await _context
            .Transactions.Where(t =>
                t.SenderId == userId || t.RecipientId == userId
            )
            .Select(t => new GetAllTransactionsResponse
            {
                Id = t.Id,
                Amount = t.Amount,
                Category = t.Category,
                IsRecurring = t.IsRecurring,
                TransactionDate = t.TransactionDate,
                User =
                    t.SenderId == userId
                        ? new GetAllTransactionsUserDto
                        {
                            Email = t.Recipient.Email,
                            Name = t.Recipient.Name,
                        }
                        : new GetAllTransactionsUserDto
                        {
                            Email = t.Sender.Email,
                            Name = t.Sender.Name,
                        },
            })
            .ToListAsync(ct);

        return transactions;
    }
}
