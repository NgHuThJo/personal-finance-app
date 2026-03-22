using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class BalanceFaker
{
    public static Faker<Balance> CreateBalanceFaker() =>
        new Faker<Balance>()
            .RuleFor(
                b => b.Current,
                (Faker f) =>
                    f.Random.Decimal(
                        TestConstants.TESTDATA_MIN_BALANCE,
                        TestConstants.TESTDATA_MAX_BALANCE
                    )
            )
            .RuleFor(b => b.Income, (Faker f) => f.Random.Decimal())
            .RuleFor(b => b.Expense, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);
}
