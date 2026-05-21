using backend.Src.Models;

namespace backend.Src.Features;

public static class TransactionQueries
{
    public static IQueryable<Transaction> ForUser(
        this IQueryable<Transaction> query,
        int userId
    ) => query.Where(t => t.SenderId == userId || t.RecipientId == userId);

    public static IQueryable<Transaction> SearchCounterParty(
        this IQueryable<Transaction> query,
        int userId,
        string search
    )
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var lower = search.ToLower();

        return query.Where(t =>
            (t.SenderId == userId ? t.Recipient.Name : t.Sender.Name)
                .ToLower()
                .Contains(lower)
        );
    }

    public static IQueryable<Transaction> FilterCategory(
        this IQueryable<Transaction> query,
        Category? category
    )
    {
        if (category is null)
        {
            return query;
        }

        return query.Where(t => t.Category == category);
    }

    public static IQueryable<Transaction> Sort(
        this IQueryable<Transaction> query,
        int userId,
        TransactionSortKey sortKey
    )
    {
        return query = sortKey switch
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
    }
};
