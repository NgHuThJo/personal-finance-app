using backend.Src.Features;
using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class PotFaker
{
    public static Faker<Pot> CreatePotFaker() =>
        new Faker<Pot>()
            .RuleFor(p => p.Name, (Faker f) => $"Pot {f.UniqueIndex}")
            .RuleFor(
                p => p.Total,
                (Faker f) =>
                    f.Random.Decimal(
                        TestConstants.TESTDATA_MIN_POT_TOTAL,
                        TestConstants.TESTDATA_MAX_POT_TOTAL
                    )
            )
            .RuleFor(
                p => p.Target,
                (Faker f) =>
                    f.Random.Decimal(
                        TestConstants.TESTDATA_MIN_POT_TARGET,
                        TestConstants.TESTDATA_MIN_POT_TARGET
                    )
            )
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);

    public static CreatePotRequest CreatePotRequest() =>
        new Faker<CreatePotRequest>()
            .RuleFor(p => p.Name, (Faker f) => $"Pot {f.UniqueIndex}")
            .RuleFor(
                p => p.Target,
                (Faker f) =>
                    f.Random.Decimal(
                        TestConstants.TESTDATA_MIN_POT_TARGET,
                        TestConstants.TESTDATA_MIN_POT_TARGET
                    )
            )
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();

    public static WithdrawMoneyFromPotRequest WithdrawMoneyFromPotRequest() =>
        new Faker<WithdrawMoneyFromPotRequest>()
            .RuleFor(p => p.WithdrawAmount, (Faker f) => f.Random.Decimal(1, 2))
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();

    public static AddMoneyToPotRequest AddMoneyToPotRequest() =>
        new Faker<AddMoneyToPotRequest>()
            .RuleFor(p => p.AddAmount, (Faker f) => f.Random.Decimal(1, 2))
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();

    public static EditPotRequest EditPotRequest() =>
        new Faker<EditPotRequest>()
            .RuleFor(p => p.PotName, (Faker f) => $"Pot {f.UniqueIndex}")
            .RuleFor(
                p => p.NewTarget,
                (Faker f) =>
                    f.Random.Decimal(
                        TestConstants.TESTDATA_MIN_POT_TARGET,
                        TestConstants.TESTDATA_MIN_POT_TARGET
                    )
            )
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();
}
