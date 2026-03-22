using backend.Src.Models;
using backend.Src.Shared;

namespace backend.Src.Features;

public abstract record BalanceError
{
    // Application errors
    public sealed record BalanceNotFound(int UserId) : BalanceError;

    // Domain errors
    public sealed record NegativeAmount : BalanceError;

    public sealed record InsufficientFunds : BalanceError;
}

public record BalanceState
{
    public required decimal BalanceCurrent { get; init; }

    public static BalanceState From(Balance balance) =>
        new() { BalanceCurrent = balance.Current };
}

public static class BalancesExtensions
{
    public static Result<BalanceState, BalanceError> DepositToBalance(
        BalanceState state,
        decimal deposit
    )
    {
        if (deposit <= 0)
        {
            return Result<BalanceState, BalanceError>.Fail(
                new BalanceError.NegativeAmount()
            );
        }

        return Result<BalanceState, BalanceError>.Ok(
            state with
            {
                BalanceCurrent = state.BalanceCurrent + deposit,
            }
        );
    }
}
