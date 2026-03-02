using backend.Src.Features;
using Bogus;

namespace backend.Shared.Test;

public static class AuthFaker
{
    public static SignUpUserRequest SignUpUserRequest() =>
        new Faker<SignUpUserRequest>()
            .RuleFor(u => u.Name, (Faker f) => f.Name.FirstName())
            .RuleFor(u => u.Email, (Faker f) => f.Internet.Email())
            .RuleFor(u => u.Password, (Faker f) => f.Internet.Password())
            .UseSeed(TestConstants.TESTDATA_SEED_IN_TEST_CLASSES)
            .Generate();
}
