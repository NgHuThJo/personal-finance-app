using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class UserAuthProviderFaker
{
    public static Faker<UserAuthProvider> CreateUserAuthProviderFaker() =>
        new Faker<UserAuthProvider>()
            .RuleFor(u => u.Provider, (Faker f) => AuthProvider.Google)
            .RuleFor(
                u => u.ProviderUserId,
                (Faker f) => $"UserAuthProvider {f.UniqueIndex}"
            )
            .UseSeed(TestConstants.TESTDATA_SEED_IN_FIXTURE);
}
