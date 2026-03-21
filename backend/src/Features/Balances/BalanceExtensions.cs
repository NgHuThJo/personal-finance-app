namespace backend.Src.Features;

public static class BalancesExtensions
{
    public static void AddMoney<T>(
        T obj,
        decimal amount,
        Func<T, decimal> get,
        Action<T, decimal> set
    )
    {
        if (amount <= 0)
        {
            throw new InvalidOperationException("Amount must be positive");
        }

        var newBalanceValue = get(obj) + amount;

        if (newBalanceValue < 0)
        {
            throw new InvalidOperationException("Balance cannot go negative");
        }

        set(obj, newBalanceValue);
    }
}
