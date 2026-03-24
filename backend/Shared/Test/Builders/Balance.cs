using backend.Src.Models;

namespace backend.Shared.Test;

public static class BalanceBuilder
{
    public static TestState WithBalance(
        this TestState state,
        Action<Balance> configure
    )
    {
        var balance = BalanceFaker.BaseBalanceFaker().Generate();
        configure(balance);

        state.Context.Add(balance);

        return state;
    }
}
