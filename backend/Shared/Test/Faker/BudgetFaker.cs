using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class BudgetFaker
{
    public static Faker<Budget> BudgetFakerForSeeding(
        int seed = TestConstants.TESTDATA_DEV_DB_SEED
    ) =>
        new Faker<Budget>()
            .RuleFor(b => b.Maximum, f => f.Random.Decimal(1, 1000))
            .RuleFor(b => b.Category, f => FakerExtensions.GetRandomCategory())
            .UseSeed(seed);

    public static Faker<Budget> BudgetFakerForTesting() =>
        new Faker<Budget>()
            .RuleFor(b => b.Maximum, f => f.Random.Decimal(1, 1000))
            .RuleFor(b => b.Category, f => FakerExtensions.GetRandomCategory());
}
