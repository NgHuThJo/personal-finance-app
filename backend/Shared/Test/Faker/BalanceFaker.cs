using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class BalanceFaker
{
    public static Faker<Balance> CreateBalanceFaker() =>
        new Faker<Balance>()
            .RuleFor(b => b.Current, (Faker f) => f.Random.Decimal())
            .RuleFor(b => b.Income, (Faker f) => f.Random.Decimal())
            .RuleFor(b => b.Expense, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);
}
