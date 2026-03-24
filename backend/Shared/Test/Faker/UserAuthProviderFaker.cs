using backend.Src.Models;
using Bogus;

namespace backend.Shared.Test;

public static class UserAuthProviderFaker
{
    public static Faker<UserAuthProvider> BaseUserAuthProviderFaker() =>
        new Faker<UserAuthProvider>()
            .RuleFor(u => u.Provider, f => AuthProvider.Google)
            .RuleFor(
                u => u.ProviderUserId,
                f => $"UserAuthProvider {f.UniqueIndex}"
            )
            .UseSeed(TestConstants.TESTDATA_DEV_DB_SEED);
}
