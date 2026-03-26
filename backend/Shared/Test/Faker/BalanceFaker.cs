using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class BalanceFaker
{
    public static Faker<Balance> BalanceFakerForSeeding(
        int seed = TestConstants.TESTDATA_DEV_DB_SEED
    ) =>
        new Faker<Balance>()
            .RuleFor(b => b.Current, f => f.Random.Int(0, 10000) / 100m)
            .RuleFor(b => b.Income, f => f.Random.Int(0, 1000) / 100m)
            .RuleFor(b => b.Expense, f => f.Random.Int(0, 500) / 100m)
            .UseSeed(seed);

    public static Faker<Balance> BalanceFakerForTesting() =>
        new Faker<Balance>()
            .RuleFor(b => b.Current, f => f.Random.Int(0, 10000) / 100m)
            .RuleFor(b => b.Income, f => f.Random.Int(0, 1000) / 100m)
            .RuleFor(b => b.Expense, f => f.Random.Int(0, 500) / 100m);
}
