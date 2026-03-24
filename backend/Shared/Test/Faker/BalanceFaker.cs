using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class BalanceFaker
{
    public static Faker<Balance> BaseBalanceFaker() =>
        new Faker<Balance>()
            .RuleFor(b => b.Current, f => f.Random.Decimal(10000, 20000))
            .RuleFor(b => b.Income, f => f.Random.Decimal(5000, 10000))
            .RuleFor(b => b.Expense, f => f.Random.Decimal(1000, 2000))
            .UseSeed(TestConstants.TESTDATA_DEV_DB_SEED);
}
