using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class BudgetFaker
{
    public static Faker<Budget> BaseBudgetFaker() =>
        new Faker<Budget>()
            .RuleFor(b => b.Maximum, f => f.Random.Decimal(1, 1000))
            .RuleFor(b => b.Category, f => FakerExtensions.GetRandomCategory())
            .UseSeed(TestConstants.TESTDATA_DEV_DB_SEED);
}
