using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class UserFaker
{
    public static Faker<User> BaseUserFaker() =>
        new Faker<User>()
            .RuleFor(u => u.Name, f => f.Name.FirstName())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.PasswordHash, f => f.Internet.Password())
            .RuleFor(
                u => u.Pots,
                f =>
                    PotFaker
                        .BasePotFaker()
                        .Generate(TestConstants.TESTDATA_NUMBER_OF_USERS)
            )
            .RuleFor(
                u => u.Balance,
                f => BalanceFaker.BaseBalanceFaker().Generate()
            )
            .RuleFor(
                u => u.Budgets,
                f =>
                    BudgetFaker
                        .BaseBudgetFaker()
                        .Generate(TestConstants.TESTDATA_NUMBER_OF_USERS)
            )
            // .RuleFor(
            //     u => u.AuthProvider,
            //     f =>
            //         UserAuthProviderFaker
            //             .CreateUserAuthProviderFaker()
            //             .Generate()
            // )
            // .RuleFor(
            //     u => u.ReceivedTransactions,
            //     f =>
            //         TransactionFaker
            //             .CreateTransactionFaker()
            //             .Generate(TestConstants.TESTDATA_NUMBER_OF_USERS)
            // )
            // .RuleFor(
            //     u => u.SentTransactions,
            //     f =>
            //         TransactionFaker
            //             .CreateTransactionFaker()
            //             .Generate(TestConstants.TESTDATA_NUMBER_OF_USERS)
            // )
            .UseSeed(TestConstants.TESTDATA_DEV_DB_SEED);
}
