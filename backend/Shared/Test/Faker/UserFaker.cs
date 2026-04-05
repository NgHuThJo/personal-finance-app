using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class UserFaker
{
    public static Faker<User> UserFakerForSeeding(
        int seed = TestConstants.TESTDATA_DEV_DB_SEED
    ) =>
        new Faker<User>()
            .RuleFor(u => u.Name, f => f.Name.FirstName())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.PasswordHash, f => f.Internet.Password())
            .RuleFor(
                u => u.Pots,
                f =>
                    PotFaker
                        .PotFakerForSeeding(seed)
                        .Generate(TestConstants.TESTDATA_ENTITY_COUNT)
            )
            .RuleFor(
                u => u.Balance,
                f => BalanceFaker.BalanceFakerForSeeding(seed).Generate()
            )
            .RuleFor(
                u => u.Budgets,
                f =>
                    BudgetFaker
                        .BudgetFakerForSeeding(seed)
                        .Generate(TestConstants.TESTDATA_ENTITY_COUNT)
            )
            // .RuleFor(
            //     u => u.AuthProvider,
            //     f =>
            //         UserAuthProviderFaker
            //             .CreateUserAuthProviderFaker()
            //             .Generate()
            // )
            .UseSeed(seed);

    public static Faker<User> UserFakerForTesting() =>
        new Faker<User>()
            .RuleFor(u => u.Name, f => f.Name.FirstName())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.PasswordHash, f => f.Internet.Password())
            .RuleFor(
                u => u.Balance,
                f => BalanceFaker.BalanceFakerForTesting().Generate()
            );
}
