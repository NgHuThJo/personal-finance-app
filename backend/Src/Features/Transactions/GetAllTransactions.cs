using System.Data;
using System.Text.Json.Serialization;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

// Does not affect parsing itself, only here for OpenAPI spec
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

    [FromQuery(Name = "searchQuery")]
    public string? SearchQuery { get; init; } = "";
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
        RuleFor(q => q.Category).IsInEnum();
        RuleFor(q => q.SortKey).IsInEnum();
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
        var searchQuery = searchParams.SearchQuery ?? "";
        var sortKey = searchParams.SortKey ?? TransactionSortKey.DateAsc;
        var category = searchParams.Category;

        var transactions = await handler.Handle(
            user.UserId,
            currentPage,
            currentPageSize,
            searchQuery,
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
        string searchQuery,
        Category? category,
        TransactionSortKey sortKey,
        CancellationToken ct
    )
    {
        // Query, filter, sort, paginate
        var query = _context
            .Transactions
            // Query and filter
            .ForUser(userId)
            .SearchCounterParty(userId, searchQuery)
            .FilterCategory(category)
            // Sort
            .Sort(userId, sortKey);
        // Once done filtering, you can count
        var count = await query.CountAsync(ct);
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
