namespace backend.Src.Features;

public abstract record BudgetError
{
    // Application errors

    public sealed record BudgetDoesNotExist(int BudgetId) : BudgetError;

    // Domain errors
}

public static class BudgetExtensions { }
