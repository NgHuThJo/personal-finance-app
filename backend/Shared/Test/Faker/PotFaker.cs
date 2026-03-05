using backend.Src.Features;
using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class PotFaker
{
    public static Faker<Pot> CreatePotFaker() =>
        new Faker<Pot>()
            .RuleFor(p => p.Name, (Faker f) => f.Name.JobDescriptor())
            .RuleFor(p => p.Total, (Faker f) => f.Random.Decimal())
            .RuleFor(p => p.Target, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);

    public static CreatePotRequest CreatePotRequest() =>
        new Faker<CreatePotRequest>()
            .RuleFor(p => p.Name, (Faker f) => f.Name.JobDescriptor())
            .RuleFor(p => p.Target, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();

    public static WithdrawMoneyFromPotRequest WithdrawMoneyFromPotRequest(
        int potId
    ) =>
        new Faker<WithdrawMoneyFromPotRequest>()
            .RuleFor(p => p.PotId, (Faker f) => potId)
            .RuleFor(p => p.MoneyWithdrawn, (Faker f) => f.Random.Decimal())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();
}
