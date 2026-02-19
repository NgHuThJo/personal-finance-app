using backend.Models;
using Bogus;

namespace backend.IntegrationTests;

public static class UserFaker
{
    public static Faker<User> CreateUserFaker() =>
        new Faker<User>()
            .RuleFor(u => u.Name, (Faker f) => f.Name.FirstName())
            .RuleFor(u => u.Email, (Faker f) => f.Internet.Email())
            .RuleFor(u => u.Password, (Faker f) => f.Internet.Password())
            .RuleFor(
                u => u.Pots,
                (Faker f) =>
                    PotFaker
                        .CreatePotFaker()
                        .Generate(TestConstants.NUMBER_OF_USERS)
            )
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);
    // .RuleFor(u => u.Balance, (Faker f) => new Balance())
    // .RuleFor(u => u.Budgets, (Faker f) => new List<Budget>())
    // .RuleFor(
    //     u => u.ReceivedTransactions,
    //     (Faker f) => new List<Transaction>()
    // )
    // .RuleFor(
    //     u => u.SentTransactions,
    //     (Faker f) => new List<Transaction>()
    // );
}
