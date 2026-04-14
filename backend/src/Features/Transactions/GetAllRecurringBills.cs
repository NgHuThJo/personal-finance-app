using System.Data;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public record GetAllRecurringBillsSearchParams
{
    [FromQuery(Name = "page")]
    public int? Page { get; init; } = 1;

    [FromQuery(Name = "pageSize")]
    public int? PageSize { get; init; } = 10;

    [FromQuery(Name = "sortKey")]
    public TransactionSortKey? SortKey { get; init; } =
        TransactionSortKey.DateDesc;

    [FromQuery(Name = "searchQuery")]
    public string? SearchQuery { get; init; } = "";
}

public record GetAllRecurringBillsUserDto
{
    public required string Name { get; init; }
    public required string Email { get; init; }
}

public record GetAllRecurringBillsTransactionDto
{
    public required int Id { get; init; }
    public required decimal Amount { get; init; }
    public required DateTimeOffset TransactionDate { get; init; }
    public required bool IsRecurring { get; init; }
    public required int SenderId { get; init; }
    public required int RecipientId { get; init; }
    public required Category Category { get; init; }
    public required GetAllRecurringBillsUserDto OtherUser { get; init; }
}

public record GetAllRecurringBillsResponse
{
    public required IReadOnlyList<GetAllRecurringBillsTransactionDto> Data { get; init; }
    public required int TransactionCount { get; init; }
}

public class GetAllRecurringBillsSearchParamsValidator
    : AbstractValidator<GetAllRecurringBillsSearchParams>
{
    public GetAllRecurringBillsSearchParamsValidator()
    {
        RuleFor(q => q.Page).GreaterThan(0);
        RuleFor(q => q.PageSize).GreaterThan(0);
        RuleFor(q => q.SortKey).IsInEnum();
    }
}

public static class GetAllRecurringBillsEndpoint
{
    public static async Task<
        Ok<GetAllRecurringBillsResponse>
    > GetAllRecurringBills(
        [AsParameters] GetAllRecurringBillsSearchParams searchParams,
        [FromServices] CurrentUser user,
        [FromServices] GetAllRecurringBillsHandler handler,
        CancellationToken ct
    )
    {
        var currentPage = searchParams.Page ?? 1;
        var currentPageSize = searchParams.PageSize ?? 10;
        var searchQuery = searchParams.SearchQuery ?? "";
        var sortKey = searchParams.SortKey ?? TransactionSortKey.DateAsc;

        var transactions = await handler.Handle(
            user.UserId,
            currentPage,
            currentPageSize,
            searchQuery,
            sortKey,
            ct
        );

        return TypedResults.Ok(transactions);
    }
}

public class GetAllRecurringBillsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<GetAllRecurringBillsResponse> Handle(
        int userId,
        int page,
        int pageSize,
        string searchQuery,
        TransactionSortKey sortKey,
        CancellationToken ct
    )
    {
        // Query, filter, sort, paginate
        var query = _context
            .Transactions
            // Query and filter
            .ForUser(userId)
            .Where(t =>
                t.IsRecurring == true
                && t.TransactionDate.Year == DateTimeOffset.UtcNow.Year
                && t.TransactionDate.Month == DateTimeOffset.UtcNow.Month
            )
            .SearchCounterParty(userId, searchQuery)
            // Sort
            .Sort(userId, sortKey);
        // Once done filtering, you can count
        var count = await query.CountAsync(ct);

        // Paginate and project
        var transactions = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new GetAllRecurringBillsTransactionDto
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
                        ? new GetAllRecurringBillsUserDto
                        {
                            Email = t.Recipient.Email,
                            Name = t.Recipient.Name,
                        }
                        : new GetAllRecurringBillsUserDto
                        {
                            Email = t.Sender.Email,
                            Name = t.Sender.Name,
                        },
            })
            .AsNoTracking()
            .ToListAsync(ct);

        return new GetAllRecurringBillsResponse
        {
            Data = transactions,
            TransactionCount = count,
        };
    }
}
