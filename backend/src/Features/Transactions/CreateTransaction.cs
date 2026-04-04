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
        Results<NoContent, ProblemHttpResult>
    > CreateTransaction(
        [FromServices] CreateTransactionRequest command,
        [FromServices] CurrentUser user,
        [FromServices] CreateTransactionHandler handler,
        CancellationToken ct
    )
    {
        var result = await handler.Handle(command, user.UserId, ct);

        return result.Match<Results<NoContent, ProblemHttpResult>>(
            _ => TypedResults.NoContent(),
            e =>
                e switch
                {
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
        var recipientEmail = await _context
            .Users.Select(u => new { u.Email, u.Id })
            .Where(u => u.Email == command.RecipientEmail)
            .FirstOrDefaultAsync(ct);

        if (recipientEmail is null)
        {
            return Result<Unit, TransactionError>.Fail(
                new TransactionError.EmailNotFound(command.RecipientEmail)
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
                .Balances.Where(b =>
                    recipientEmail.Email == command.RecipientEmail
                )
                .Include(b => b.User)
                .FirstOrDefaultAsync(ct)
            ?? throw new InvalidDataException(
                $"Recipient with ID {recipientEmail.Id} does not have balance"
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
