using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class TransactionFaker
{
    public static Faker<Transaction> BaseTransactionFaker() =>
        new Faker<Transaction>()
            .RuleFor(t => t.Amount, f => f.Random.Decimal(10, 20))
            .RuleFor(t => t.Created, f => f.Date.Recent())
            .RuleFor(t => t.TransactionDate, f => f.Date.Recent())
            .RuleFor(t => t.IsRecurring, false)
            .RuleFor(t => t.Category, f => FakerExtensions.GetRandomCategory())
            .UseSeed(TestConstants.TESTDATA_DEV_DB_SEED);
}
