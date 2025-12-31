using backend.Features;
using Bogus;

namespace backend.IntegrationTests;

public static class PotFaker
{
    // public static GetAllPotsRequest GetAllPots => new Faker<GetAllPotsRequest>().RuleFor(p => p., (Faker f) => f.).Generate();
    public static CreatePotRequest CreatePot() =>
        new Faker<CreatePotRequest>()
            .RuleFor(p => p.Name, (Faker f) => f.Name.JobDescriptor())
            .RuleFor(p => p.Target, (Faker f) => f.Random.Decimal())
            .RuleFor(
                p => p.UserId,
                (Faker f) => f.Database.Random.Int(min: 1, max: 2)
            )
            .Generate();
}
