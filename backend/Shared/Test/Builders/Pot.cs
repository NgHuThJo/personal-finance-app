using backend.Src.Models;

namespace backend.Shared.Test;

public static class PotBuilder
{
    public static TestState WithPot(
        this TestState state,
        Action<Pot> configure,
        out Pot pot,
        User? user = null
    )
    {
        var newPot = PotFaker.PotFakerForTesting().Generate();
        configure(newPot);
        newPot.User = user ?? state.DefaultUser;

        state.Context.Add(newPot);
        pot = newPot;

        return state;
    }

    public static TestState WithManyPots(
        this TestState state,
        Action<List<Pot>> configure,
        int count
    )
    {
        var pots = PotFaker.PotFakerForTesting().Generate(count);
        configure(pots);

        foreach (var pot in pots)
        {
            pot.User = state.DefaultUser;
        }

        state.Context.AddRange(pots);

        return state;
    }
}
