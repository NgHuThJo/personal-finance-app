using backend.Src.Invariants;
using backend.Src.Models;
using backend.Src.Shared;
using Microsoft.AspNetCore.Http.HttpResults;

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

    public sealed record PotNameAlreadyExists : PotError;
}

public record PotState
{
    public required decimal BalanceCurrent { get; init; }
    public required decimal PotTotal { get; init; }
    public required decimal PotTarget { get; init; }
    public required string PotName { get; init; }

    public static PotState From(Pot pot, Balance balance) =>
        new()
        {
            BalanceCurrent = balance.Current,
            PotName = pot.Name,
            PotTarget = pot.Target,
            PotTotal = pot.Total,
        };
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

    public static Result<PotState, PotError> ChangeName(
        PotState state,
        string name
    )
    {
        if (PotRules.HasSameName(state.PotName, name))
        {
            return Result<PotState, PotError>.Fail(
                new PotError.PotNameAlreadyExists()
            );
        }

        return Result<PotState, PotError>.Ok(state with { PotName = name });
    }

    public static Result<PotState, PotError> ChangeTarget(
        PotState state,
        decimal target
    )
    {
        if (target < 0)
        {
            return Result<PotState, PotError>.Fail(
                new PotError.NegativeAmount()
            );
        }

        var overflow = Math.Max(0, state.PotTotal - target);

        return Result<PotState, PotError>.Ok(
            state with
            {
                BalanceCurrent = state.BalanceCurrent + overflow,
                PotTotal = state.PotTotal - overflow,
                PotTarget = target,
            }
        );
    }

    public static Result<PotState, PotError> TransferDepositToBalance(
        PotState state
    )
    {
        return Result<PotState, PotError>.Ok(
            state with
            {
                BalanceCurrent = state.BalanceCurrent + state.PotTotal,
                PotTotal = 0,
            }
        );
    }
}
