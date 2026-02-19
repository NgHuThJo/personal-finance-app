using backend.Features;
using backend.Models;
using Bogus;

namespace backend.IntegrationTests;

public static class PotFaker
{
    // public static GetAllPotsRequest GetAllPots => new Faker<GetAllPotsRequest>().RuleFor(p => p., (Faker f) => f.).Generate();
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
}
