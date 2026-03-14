using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class UserFaker
{
    public static Faker<User> CreateUserFaker() =>
        new Faker<User>()
            .RuleFor(u => u.Name, (Faker f) => f.Name.FirstName())
            .RuleFor(u => u.Email, (Faker f) => f.Internet.Email())
            .RuleFor(u => u.PasswordHash, (Faker f) => f.Internet.Password())
            .RuleFor(
                u => u.Pots,
                (Faker f) =>
                    PotFaker
                        .CreatePotFaker()
                        .Generate(TestConstants.NUMBER_OF_USERS)
            )
            .RuleFor(
                u => u.Balance,
                (Faker f) => BalanceFaker.CreateBalanceFaker().Generate()
            )
            .RuleFor(
                u => u.Budgets,
                (Faker f) =>
                    BudgetFaker
                        .CreateBudgetFaker()
                        .Generate(TestConstants.NUMBER_OF_USERS)
            )
            // .RuleFor(
            //     u => u.AuthProvider,
            //     (Faker f) =>
            //         UserAuthProviderFaker
            //             .CreateUserAuthProviderFaker()
            //             .Generate()
            // )
            // .RuleFor(
            //     u => u.ReceivedTransactions,
            //     (Faker f) =>
            //         TransactionFaker
            //             .CreateTransactionFaker()
            //             .Generate(TestConstants.NUMBER_OF_USERS)
            // )
            // .RuleFor(
            //     u => u.SentTransactions,
            //     (Faker f) =>
            //         TransactionFaker
            //             .CreateTransactionFaker()
            //             .Generate(TestConstants.NUMBER_OF_USERS)
            // )
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);
}
