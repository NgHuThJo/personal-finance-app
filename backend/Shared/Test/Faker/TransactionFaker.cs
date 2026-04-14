using backend.Src.Features;
using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class TransactionFaker
{
    public static Faker<Transaction> TransactionFakerForSeeding(
        int seed = TestConstants.TESTDATA_DEV_DB_SEED
    ) =>
        new Faker<Transaction>()
            .RuleFor(t => t.Amount, f => f.Random.Int(100, 200) / 100m)
            .RuleFor(t => t.Created, f => f.Date.Recent())
            .RuleFor(
                t => t.TransactionDate,
                f => DateTimeOffset.UtcNow.AddDays(1)
            )
            .RuleFor(t => t.IsRecurring, new Random().NextSingle() <= 0.5)
            .RuleFor(t => t.Category, f => FakerExtensions.GetRandomCategory())
            .UseSeed(seed);

    public static Faker<Transaction> TransactionFakerForTesting() =>
        new Faker<Transaction>()
            .RuleFor(t => t.Amount, f => f.Random.Int(100, 200) / 100m)
            .RuleFor(t => t.Created, f => f.Date.Recent())
            .RuleFor(
                t => t.TransactionDate,
                f => DateTimeOffset.UtcNow.AddDays(1)
            )
            .RuleFor(t => t.IsRecurring, false)
            .RuleFor(t => t.Category, f => FakerExtensions.GetRandomCategory());

    public static CreateTransactionRequest CreateTransactionRequest() =>
        new Faker<CreateTransactionRequest>()
            .RuleFor(t => t.Amount, f => f.Random.Int(100, 200) / 100m)
            .RuleFor(
                t => t.TransactionDate,
                f => DateTimeOffset.UtcNow.AddDays(1)
            )
            .RuleFor(t => t.IsRecurring, false)
            .RuleFor(t => t.Category, f => FakerExtensions.GetRandomCategory())
            .RuleFor(t => t.RecipientEmail, f => f.Internet.Email())
            .Generate();
}
