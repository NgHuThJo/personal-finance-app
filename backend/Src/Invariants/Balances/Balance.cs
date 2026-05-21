namespace backend.Src.Invariants;

public static class BalanceRules
{
    public static bool InsufficientFunds(decimal balance, decimal amount) =>
        amount > balance;
}
