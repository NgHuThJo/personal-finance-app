using backend.Features;
using Bogus;

namespace backend.IntegrationTests;

public static class AuthFaker
{
    public static SignUpUserRequest CreateSignUpUser() =>
        new Faker<SignUpUserRequest>()
            .RuleFor(u => u.Name, (Faker f) => f.Name.FirstName())
            .RuleFor(u => u.Email, (Faker f) => f.Internet.Email())
            .RuleFor(u => u.Password, (Faker f) => f.Internet.Password())
            .Generate();
}
