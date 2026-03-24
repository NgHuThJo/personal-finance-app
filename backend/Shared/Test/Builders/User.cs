using backend.Src.Models;

namespace backend.Shared.Test;

public static class UserBuilder
{
    public static TestState WithUser(
        this TestState state,
        Action<User> configure
    )
    {
        var user = UserFaker.BaseUserFaker().Generate();
        configure(user);

        state.Context.Add(user);

        return state;
    }

    public static TestState WithManyUser(
        this TestState state,
        Action<List<User>> configure,
        int count
    )
    {
        var users = UserFaker.BaseUserFaker().Generate(count);
        configure(users);

        state.Context.AddRange(users);

        return state;
    }
}
