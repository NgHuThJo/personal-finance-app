using backend.Src.Models;

namespace backend.Shared.Test;

public static class BalanceBuilder
{
    public static TestState WithBalance(
        this TestState state,
        Action<Balance> configure,
        out Balance balance,
        User? user = null
    )
    {
        var newBalance = BalanceFaker.BalanceFakerForTesting().Generate();
        configure(newBalance);
        newBalance.User = user ?? state.DefaultUser;

        state.Context.Add(newBalance);

        balance = newBalance;

        return state;
    }
}
