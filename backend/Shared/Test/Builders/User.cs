using backend.Src.Models;

namespace backend.Shared.Test;

public static class UserBuilder
{
    public static TestState WithUser(
        this TestState state,
        Action<User> configure,
        out User user
    )
    {
        var newUser = UserFaker.UserFakerForTesting().Generate();
        configure(newUser);

        state.Context.Add(newUser);
        user = newUser;

        return state;
    }

    public static TestState WithManyUser(
        this TestState state,
        Action<List<User>> configure,
        int count
    )
    {
        var users = UserFaker.UserFakerForTesting().Generate(count);
        configure(users);

        state.Context.AddRange(users);

        return state;
    }
}
