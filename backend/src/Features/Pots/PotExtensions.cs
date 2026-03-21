using backend.Src.Invariants;
using backend.Src.Shared;

namespace backend.Src.Features;

public abstract record PotError
{
    // Application errors
    public sealed record PotNotFound(int PotId) : PotError;

    public sealed record BalanceNotFound(int UserId) : PotError;

    // Domain errors
    public sealed record NegativeAmount : PotError;

    public sealed record InsufficientFunds : PotError;

    public sealed record PotTargetExceeded : PotError;
}

public record PotState
{
    public required decimal BalanceCurrent { get; init; }
    public required decimal PotTotal { get; init; }
    public required decimal PotTarget { get; init; }
}

public static class PotExtensions
{
    public static Result<PotState, PotError> DraftFromPot(
        PotState state,
        decimal draft
    )
    {
        if (draft < 0)
        {
            return Result<PotState, PotError>.Fail(
                new PotError.NegativeAmount()
            );
        }

        if (PotRules.ExceedsTotal(state.PotTotal, draft))
        {
            return Result<PotState, PotError>.Fail(
                new PotError.InsufficientFunds()
            );
        }

        var newBalance = state.BalanceCurrent + draft;
        var newPotTotal = state.PotTotal - draft;

        return Result<PotState, PotError>.Ok(
            state with
            {
                BalanceCurrent = newBalance,
                PotTotal = newPotTotal,
            }
        );
    }

    public static Result<PotState, PotError> DepositToPot(
        PotState state,
        decimal deposit
    )
    {
        if (deposit < 0)
        {
            return Result<PotState, PotError>.Fail(
                new PotError.NegativeAmount()
            );
        }

        if (BalanceRules.InsufficientFunds(state.BalanceCurrent, deposit))
        {
            return Result<PotState, PotError>.Fail(
                new PotError.InsufficientFunds()
            );
        }

        var newPotTotal = state.PotTotal + deposit;

        if (PotRules.ExceedsTarget(newPotTotal, state.PotTarget))
        {
            return Result<PotState, PotError>.Fail(
                new PotError.PotTargetExceeded()
            );
        }

        var newBalance = state.BalanceCurrent - deposit;

        return Result<PotState, PotError>.Ok(
            state with
            {
                BalanceCurrent = newBalance,
                PotTotal = newPotTotal,
            }
        );
    }
}
