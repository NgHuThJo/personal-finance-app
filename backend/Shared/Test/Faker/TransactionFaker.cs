using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class TransactionFaker
{
    public static Faker<Transaction> CreateTransactionFaker() =>
        new Faker<Transaction>()
            .RuleFor(t => t.Amount, (Faker f) => f.Random.Decimal())
            .RuleFor(t => t.Created, (Faker f) => f.Date.Recent())
            .RuleFor(t => t.TransactionDate, (Faker f) => f.Date.Recent())
            .RuleFor(t => t.IsRecurring, false)
            .RuleFor(t => t.Category, (Faker f) => Category.Entertainment)
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);
}
