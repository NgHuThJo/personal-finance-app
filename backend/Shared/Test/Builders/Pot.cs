using backend.Src.Models;

namespace backend.Shared.Test;

public static class PotBuilder
{
    public static TestState WithPot(this TestState state, Action<Pot> configure)
    {
        var pot = PotFaker.BasePotFaker().Generate();
        configure(pot);

        state.Context.Add(pot);

        return state;
    }

    public static TestState WithManyPots(
        this TestState state,
        Action<List<Pot>> configure,
        int count
    )
    {
        var pots = PotFaker.BasePotFaker().Generate(count);
        configure(pots);

        state.Context.AddRange(pots);

        return state;
    }
}
