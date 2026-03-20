using backend.Src.Shared;

namespace backend.Src.Features;

public abstract record PotsError
{
    public sealed record NegativeAmount : PotsError;

    public sealed record InsufficientFunds : PotsError;
}

public static class PotsExtensions
{
    public static Result<(decimal, decimal), PotsError> WithdrawMoney(
        decimal currentBalance,
        decimal currentPotTotal,
        decimal amountToWithdraw
    )
    {
        if (amountToWithdraw <= 0)
        {
            return Result<(decimal, decimal), PotsError>.Fail(
                new PotsError.NegativeAmount()
            );
        }

        if (
            amountToWithdraw > currentBalance
            || amountToWithdraw > currentPotTotal
        )
        {
            return Result<(decimal, decimal), PotsError>.Fail(
                new PotsError.InsufficientFunds()
            );
        }

        var newBalance = currentBalance - amountToWithdraw;
        var newPotTotal = currentPotTotal - amountToWithdraw;

        return Result<(decimal, decimal), PotsError>.Ok(
            (newBalance, newPotTotal)
        );
    }
}
