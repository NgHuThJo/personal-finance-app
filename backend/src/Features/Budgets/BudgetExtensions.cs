namespace backend.Src.Features;

public abstract record BudgetError
{
    // Application errors
    public sealed record PotNotFound(int PotId) : BudgetError;

    public sealed record BalanceNotFound(int UserId) : BudgetError;

    // Domain errors
    public sealed record NegativeAmount : BudgetError;

    public sealed record InsufficientFunds : BudgetError;

    public sealed record PotTargetExceeded : BudgetError;

    public sealed record PotNameAlreadyExists : BudgetError;
}

public static class BudgetExtensions { }
