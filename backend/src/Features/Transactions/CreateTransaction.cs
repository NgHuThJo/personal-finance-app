using backend.Src.Invariants;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public record CreateTransactionRequest
{
    public required decimal Amount { get; init; }
    public required DateTimeOffset TransactionDate { get; init; }
    public required bool IsRecurring { get; init; }
    public required Category Category { get; init; }
    public required string RecipientEmail { get; init; }
}

public class CreateTransactionValidator
    : AbstractValidator<CreateTransactionRequest>
{
    public CreateTransactionValidator()
    {
        RuleFor(t => t.Amount).GreaterThan(0).PrecisionScale(14, 2, true);
        RuleFor(t => t.TransactionDate)
            .Must(transactionDate => transactionDate >= DateTimeOffset.UtcNow);
        RuleFor(t => t.Category).IsInEnum();
        RuleFor(t => t.RecipientEmail).EmailAddress();
    }
}

public static class CreateTransactionEndpoint
{
    public static async Task<
        Results<NoContent, BadRequest, ProblemHttpResult>
    > CreateTransaction(
        [FromBody] CreateTransactionRequest command,
        [FromServices] CurrentUser user,
        [FromServices] CreateTransactionHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.Handle(command, user.UserId, ct);

        return result.Match<Results<NoContent, BadRequest, ProblemHttpResult>>(
            _ => TypedResults.NoContent(),
            e =>
                e switch
                {
                    TransactionError.SenderAndReceiverAreSameUser(int userId) =>
                        TypedResultsProblemDetails.BadRequest(
                            $"Sender and recipient are the same user with ID {userId}"
                        ),
                    TransactionError.EmailNotFound(string email) =>
                        TypedResultsProblemDetails.UnprocessableContent(
                            $"Recipient with email address {email} does not exist"
                        ),
                    TransactionError.InsufficientFunds =>
                        TypedResultsProblemDetails.UnprocessableContent(
                            "Transaction not created because of insufficient funds"
                        ),
                    _ => throw new InvalidOperationException(
                        $"An unknown error occurred in {nameof(CreateTransaction)}"
                    ),
                }
        );
    }
}

public class CreateTransactionHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<Result<Unit, TransactionError>> Handle(
        CreateTransactionRequest command,
        int userId,
        CancellationToken ct
    )
    {
        var recipientEmailAndId = await _context
            .Users.Select(u => new { u.Email, u.Id })
            .Where(u => u.Email == command.RecipientEmail)
            .FirstOrDefaultAsync(ct);

        if (recipientEmailAndId is null)
        {
            return Result<Unit, TransactionError>.Fail(
                new TransactionError.EmailNotFound(command.RecipientEmail)
            );
        }

        if (recipientEmailAndId.Id == userId)
        {
            return Result<Unit, TransactionError>.Fail(
                new TransactionError.SenderAndReceiverAreSameUser(userId)
            );
        }

        var senderBalance =
            await _context
                .Balances.Where(b => b.UserId == userId)
                .Include(b => b.User)
                .SingleOrDefaultAsync(ct)
            ?? throw new InvalidDataException(
                $"Sender with ID {userId} does not a balance"
            );
        var recipientBalance =
            await _context
                .Balances.Where(b => b.UserId == recipientEmailAndId.Id)
                .Include(b => b.User)
                .FirstOrDefaultAsync(ct)
            ?? throw new InvalidDataException(
                $"Recipient with ID {recipientEmailAndId.Id} does not have balance"
            );

        if (
            BalanceRules.InsufficientFunds(
                senderBalance.Current,
                command.Amount
            )
        )
        {
            return Result<Unit, TransactionError>.Fail(
                new TransactionError.InsufficientFunds()
            );
        }

        var newTransaction = new Transaction
        {
            Amount = command.Amount,
            Category = command.Category,
            IsRecurring = command.IsRecurring,
            TransactionDate = command.TransactionDate,
            Sender = senderBalance.User,
            Recipient = recipientBalance.User,
        };

        _context.Transactions.Add(newTransaction);

        await _context.SaveChangesAsync(ct);

        return Result<Unit, TransactionError>.Ok(Unit.Value);
    }
}
