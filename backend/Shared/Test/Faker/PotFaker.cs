using backend.Src.Features;
using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class PotFaker
{
    public static Faker<Pot> CreatePotFaker() =>
        new Faker<Pot>()
            .RuleFor(p => p.Name, (Faker f) => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.Total, (Faker f) => f.Random.Decimal())
            .RuleFor(p => p.Target, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);

    public static CreatePotRequest CreatePotRequest() =>
        new Faker<CreatePotRequest>()
            .RuleFor(p => p.Name, (Faker f) => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.Target, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();

    public static WithdrawMoneyFromPotRequest WithdrawMoneyFromPotRequest() =>
        new Faker<WithdrawMoneyFromPotRequest>()
            .RuleFor(p => p.WithdrawAmount, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();

    public static AddMoneyToPotRequest AddMoneyToPotRequest() =>
        new Faker<AddMoneyToPotRequest>()
            .RuleFor(p => p.MoneyAdded, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();
}
