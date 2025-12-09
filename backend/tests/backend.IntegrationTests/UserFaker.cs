using backend.Features;
using Bogus;

namespace backend.IntegrationTests;

public static class UserFaker
{
    public static Faker<CreateUserRequest> CreateUser() =>
        new Faker<CreateUserRequest>()
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.Password, f => f.Internet.Password());
}
