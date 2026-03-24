using backend.Src.Features;
using Bogus;

namespace backend.Shared.Test;

public static class AuthFaker
{
    public static SignUpUserRequest SignUpUserRequest(
        Action<SignUpUserRequest>? configure = null
    )
    {
        var signup = new Faker<SignUpUserRequest>()
            .RuleFor(u => u.Name, f => f.Name.FirstName())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.Password, f => f.Internet.Password())
            .UseSeed(TestConstants.TESTDATA_DTO_SEED)
            .Generate();

        configure?.Invoke(signup);

        return signup;
    }
}
