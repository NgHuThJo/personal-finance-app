using backend.Src.Features;
using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class PotFaker
{
    public static Faker<Pot> PotFakerForSeeding(
        int seed = TestConstants.TESTDATA_DEV_DB_SEED
    ) =>
        new Faker<Pot>()
            .RuleFor(p => p.Name, f => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.Total, f => f.Random.Int(1, 1000) / 100m)
            .RuleFor(p => p.Target, f => f.Random.Int(1000, 2000) / 100m)
            .UseSeed(seed);

    public static Faker<Pot> PotFakerForTesting() =>
        new Faker<Pot>()
            .RuleFor(p => p.Name, f => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.Total, f => f.Random.Int(1, 1000) / 100m)
            .RuleFor(p => p.Target, f => f.Random.Int(1000, 2000) / 100m);

    public static CreatePotRequest CreatePotRequest()
    {
        var pot = new Faker<CreatePotRequest>()
            .RuleFor(p => p.Name, f => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.Target, f => f.Random.Int(1000, 2000) / 100m)
            .Generate();

        return pot;
    }

    public static WithdrawMoneyFromPotRequest WithdrawMoneyFromPotRequest()
    {
        var pot = new Faker<WithdrawMoneyFromPotRequest>()
            .RuleFor(p => p.WithdrawAmount, f => f.Random.Int(10, 20) / 100m)
            .Generate();

        return pot;
    }

    public static AddMoneyToPotRequest AddMoneyToPotRequest()
    {
        var pot = new Faker<AddMoneyToPotRequest>()
            .RuleFor(p => p.AddAmount, f => f.Random.Int(10, 20) / 100m)
            .Generate();

        return pot;
    }

    public static EditPotRequest EditPotRequest()
    {
        var pot = new Faker<EditPotRequest>()
            .RuleFor(p => p.PotName, f => $"Pot {f.UniqueIndex}")
            .RuleFor(p => p.NewTarget, f => f.Random.Int(50, 150) / 100m)
            .Generate();

        return pot;
    }
}
