using System.Data;
using System.Text.Json.Serialization;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TransactionSortKey
{
    DateAsc,
    DateDesc,
    NameAsc,
    NameDesc,
    AmountAsc,
    AmountDesc,
}

public record GetAllTransactionsSearchParams
{
    [FromQuery(Name = "page")]
    public int? Page { get; init; } = 1;

    [FromQuery(Name = "pageSize")]
    public int? PageSize { get; init; } = 10;

    [FromQuery(Name = "category")]
    public Category? Category { get; init; } = null;

    [FromQuery(Name = "sortKey")]
    public TransactionSortKey? SortKey { get; init; } =
        TransactionSortKey.DateDesc;
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
    public required int TransactionCount { get; init; }
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
        var sortKey = searchParams.SortKey ?? TransactionSortKey.DateAsc;
        var category = searchParams.Category;

        var transactions = await handler.Handle(
            user.UserId,
            currentPage,
            currentPageSize,
            category,
            sortKey,
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
        Category? category,
        TransactionSortKey sortKey,
        CancellationToken ct
    )
    {
        // Query, filter, sort, paginate
        // Query and filter
        var query = _context.Transactions.Where(t =>
            t.SenderId == userId || t.RecipientId == userId
        );
        query = category is null
            ? query
            : query.Where(t => t.Category == category);
        // Once done filtering, you can count
        var count = await query.CountAsync(ct);
        // Sort
        query = sortKey switch
        {
            TransactionSortKey.AmountAsc => query
                .OrderBy(t => t.Amount)
                .ThenBy(t => t.Id),
            TransactionSortKey.AmountDesc => query
                .OrderByDescending(t => t.Amount)
                .ThenByDescending(t => t.Id),
            TransactionSortKey.DateAsc => query
                .OrderBy(t => t.TransactionDate)
                .ThenBy(t => t.Id),
            TransactionSortKey.DateDesc => query
                .OrderByDescending(t => t.TransactionDate)
                .ThenByDescending(t => t.Id),
            TransactionSortKey.NameAsc => query
                .OrderBy(t =>
                    t.SenderId == userId ? t.Recipient.Name : t.Sender.Name
                )
                .ThenBy(t => t.Id),
            TransactionSortKey.NameDesc => query
                .OrderByDescending(t =>
                    t.SenderId == userId ? t.Recipient.Name : t.Sender.Name
                )
                .ThenByDescending(t => t.Id),
            _ => throw new ArgumentOutOfRangeException(nameof(sortKey)),
        };

        // Paginate and project
        var transactions = await query
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
            TransactionCount = count,
        };
    }
}
