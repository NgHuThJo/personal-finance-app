using backend.Src.Models;

namespace backend.Shared.Test;

public static class BudgetBuilder
{
    public static TestState WithBudget(
        this TestState state,
        Action<Budget> configure,
        out Budget budget,
        User? user = null
    )
    {
        var newBudget = BudgetFaker.BudgetFakerForTesting().Generate();
        configure(newBudget);
        newBudget.User = user ?? state.DefaultUser;
        state.Context.Budgets.Add(newBudget);

        budget = newBudget;

        return state;
    }
}
