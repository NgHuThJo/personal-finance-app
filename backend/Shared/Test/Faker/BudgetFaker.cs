using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class BudgetFaker
{
    public static Faker<Budget> CreateBudgetFaker() =>
        new Faker<Budget>()
            .RuleFor(b => b.Maximum, (Faker f) => f.Random.Decimal())
            .RuleFor(b => b.Category, (Faker f) => Category.Bills)
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);
}
