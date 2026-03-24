using backend.Src.Features;
using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class PotFaker
{
    public static Faker<Pot> BasePotFaker() =>
        new Faker<Pot>()
            .RuleFor(p => p.Name, f => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.Total, f => f.Random.Decimal(50, 100))
            .RuleFor(p => p.Target, f => f.Random.Decimal(100, 200))
            .UseSeed(TestConstants.TESTDATA_DEV_DB_SEED);

    public static CreatePotRequest CreatePotRequest(
        Action<CreatePotRequest>? configure = null
    )
    {
        var pot = new Faker<CreatePotRequest>()
            .RuleFor(p => p.Name, f => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.Target, f => f.Random.Decimal(100, 200))
            .UseSeed(TestConstants.TESTDATA_DTO_SEED)
            .Generate();
        configure?.Invoke(pot);

        return pot;
    }

    public static WithdrawMoneyFromPotRequest WithdrawMoneyFromPotRequest(
        Action<WithdrawMoneyFromPotRequest>? configure = null
    )
    {
        var pot = new Faker<WithdrawMoneyFromPotRequest>()
            .RuleFor(p => p.WithdrawAmount, f => f.Random.Decimal(10, 20))
            .UseSeed(TestConstants.TESTDATA_DTO_SEED)
            .Generate();
        configure?.Invoke(pot);

        return pot;
    }

    public static AddMoneyToPotRequest AddMoneyToPotRequest(
        Action<AddMoneyToPotRequest>? configure = null
    )
    {
        var pot = new Faker<AddMoneyToPotRequest>()
            .RuleFor(p => p.AddAmount, f => f.Random.Decimal(10, 20))
            .UseSeed(TestConstants.TESTDATA_DTO_SEED)
            .Generate();
        configure?.Invoke(pot);

        return pot;
    }

    public static EditPotRequest EditPotRequest(
        Action<EditPotRequest>? configure = null
    )
    {
        var pot = new Faker<EditPotRequest>()
            .RuleFor(p => p.PotName, f => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.NewTarget, f => f.Random.Decimal(50, 150))
            .UseSeed(TestConstants.TESTDATA_DTO_SEED)
            .Generate();
        configure?.Invoke(pot);

        return pot;
    }
}
