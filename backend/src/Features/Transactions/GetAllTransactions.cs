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
    [FromQuery(Name = "page")]
    public int? Page { get; init; } = 1;

    [FromQuery(Name = "pageSize")]
    public int? PageSize { get; init; } = 10;
}

public record GetAllTransactionsUserDto
{
    public required string Name { get; init; }
    public required string Email { get; init; }
}

public record GetAllTransactionsTransactionDto
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

public record GetAllTransactionsResponse
{
    public required IReadOnlyList<GetAllTransactionsTransactionDto> Data { get; init; }
    public required int PageCount { get; init; }
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
    public static async Task<Ok<GetAllTransactionsResponse>> GetAllTransactions(
        [AsParameters] GetAllTransactionsSearchParams searchParams,
        [FromServices] CurrentUser user,
        [FromServices] GetAllTransactionsHandler handler,
        CancellationToken ct
    )
    {
        var currentPage = searchParams.Page ?? 1;
        var currentPageSize = searchParams.PageSize ?? 10;

        var transactions = await handler.Handle(
            user.UserId,
            currentPage,
            currentPageSize,
            ct
        );

        return TypedResults.Ok(transactions);
    }
}

public class GetAllTransactionsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<GetAllTransactionsResponse> Handle(
        int userId,
        int page,
        int pageSize,
        CancellationToken ct
    )
    {
        var senders = _context.Transactions.Where(t => t.SenderId == userId);
        var recipients = _context.Transactions.Where(t =>
            t.RecipientId == userId
        );

        var query = senders.Concat(recipients);
        var count = await query.CountAsync(ct);

        var transactions = await query
            .OrderByDescending(t => t.TransactionDate)
            .ThenByDescending(t => t.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new GetAllTransactionsTransactionDto
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

        return new GetAllTransactionsResponse
        {
            Data = transactions,
            PageCount = count,
        };
    }
}
