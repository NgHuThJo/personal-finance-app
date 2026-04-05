using backend.Src.Invariants;
using backend.Src.Models;
using backend.Src.Shared;

namespace backend.Src.Features;

public abstract record TransactionError
{
    // Application errors
    public sealed record TransactionNotFound(int TransactionId)
        : TransactionError;

    public sealed record SenderAndReceiverAreSameUser(int UserId)
        : TransactionError;

    public sealed record EmailNotFound(string Email) : TransactionError;

    // Domain errors
    public sealed record NegativeAmount : TransactionError;

    public sealed record InsufficientFunds : TransactionError;
}

public record TransactionState
{
    public required decimal SenderBalanceCurrent { get; init; }
    public required decimal RecipientBalanceCurrent { get; init; }

    public static TransactionState From(
        Balance senderBalance,
        Balance recipientBalance
    ) =>
        new()
        {
            SenderBalanceCurrent = senderBalance.Current,
            RecipientBalanceCurrent = recipientBalance.Current,
        };
}

public static class TransactionExtensions
{
    public static Result<TransactionState, TransactionError> MakeTransaction(
        TransactionState state,
        decimal transactionAmount
    )
    {
        if (
            BalanceRules.InsufficientFunds(
                state.SenderBalanceCurrent,
                transactionAmount
            )
        )
        {
            return Result<TransactionState, TransactionError>.Fail(
                new TransactionError.InsufficientFunds()
            );
        }

        return Result<TransactionState, TransactionError>.Ok(
            state with
            {
                SenderBalanceCurrent =
                    state.SenderBalanceCurrent - transactionAmount,
                RecipientBalanceCurrent =
                    state.RecipientBalanceCurrent + transactionAmount,
            }
        );
    }
}
