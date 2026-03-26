using backend.Src.Features;
using Bogus;

namespace backend.Shared.Test;

public static class AuthFaker
{
    public static SignUpUserRequest SignUpUserRequest()
    {
        var signup = new Faker<SignUpUserRequest>()
            .RuleFor(u => u.Name, f => f.Name.FirstName())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.Password, f => f.Internet.Password())
            .Generate();

        return signup;
    }

    public static LoginUserRequest LoginUserRequest()
    {
        var login = new Faker<LoginUserRequest>()
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.Password, f => f.Internet.Password())
            .Generate();

        return login;
    }
}
