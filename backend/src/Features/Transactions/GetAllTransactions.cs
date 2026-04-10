using System.Data;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public record GetAllTransactionsSearchParams
{
    public required int Page { get; init; } = 1;
    public required int PageSize { get; init; } = 10;
}

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
    public required int SenderId { get; init; }
    public required int RecipientId { get; init; }
    public required Category Category { get; init; }
    public required GetAllTransactionsUserDto OtherUser { get; init; }
}

public class GetAllTransactionsSearchParamsValidator
    : AbstractValidator<GetAllTransactionsSearchParams>
{
    public GetAllTransactionsSearchParamsValidator()
    {
        RuleFor(q => q.Page).GreaterThan(0);
        RuleFor(q => q.PageSize).GreaterThan(0);
    }
}

public static class GetAllTransactionsEndpoint
{
    public static async Task<
        Ok<List<GetAllTransactionsResponse>>
    > GetAllTransactions(
        [FromQuery] GetAllTransactionsSearchParams searchParams,
        [FromServices] CurrentUser user,
        [FromServices] GetAllTransactionsHandler handler,
        CancellationToken ct
    )
    {
        var transactions = await handler.Handle(user.UserId, searchParams, ct);

        return TypedResults.Ok(transactions);
    }
}

public class GetAllTransactionsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetAllTransactionsResponse>> Handle(
        int userId,
        GetAllTransactionsSearchParams searchParams,
        CancellationToken ct
    )
    {
        var senders = _context.Transactions.Where(t => t.SenderId == userId);
        var recipients = _context.Transactions.Where(t =>
            t.RecipientId == userId
        );

        var query = senders.Union(recipients);

        var transactions = await query
            .OrderByDescending(t => t.TransactionDate)
            .ThenByDescending(t => t.Id)
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .Select(t => new GetAllTransactionsResponse
            {
                Id = t.Id,
                Amount = t.Amount,
                Category = t.Category,
                IsRecurring = t.IsRecurring,
                TransactionDate = t.TransactionDate,
                SenderId = t.SenderId,
                RecipientId = t.RecipientId,
                OtherUser =
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
            .AsNoTracking()
            .ToListAsync(ct);

        return transactions;
    }
}
