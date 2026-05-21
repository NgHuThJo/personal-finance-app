using backend.Src.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Features;

public class TransactionBackgroundService(IServiceScopeFactory scopeFactory)
    : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var db =
                    scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var now = DateTimeOffset.UtcNow;

                var dueTransactions = await db
                    .Transactions.Where(t => t.IsRecurring || !t.IsProcessed)
                    .Include(t => t.Sender)
                        .ThenInclude(u => u.Balance)
                    .Include(t => t.Recipient)
                        .ThenInclude(u => u.Balance)
                    .ToListAsync(ct);

                foreach (var transaction in dueTransactions)
                {
                    var senderBalance = transaction.Sender.Balance;
                    var recipientBalance = transaction.Recipient.Balance;

                    var state = TransactionState.From(
                        senderBalance,
                        recipientBalance
                    );

                    var result = TransactionExtensions.MakeTransaction(
                        state,
                        transaction.Amount
                    );

                    if (!result.IsSuccess)
                    {
                        Console.WriteLine(
                            $"{nameof(result.Error)}: transaction with ID {transaction.Id} failed"
                        );
                        continue;
                    }

                    var newState = result.Value;

                    senderBalance.Current = newState.SenderBalanceCurrent;
                    recipientBalance.Current = newState.RecipientBalanceCurrent;

                    if (transaction.IsRecurring)
                    {
                        var newTransaction = new Transaction
                        {
                            Amount = transaction.Amount,
                            Category = transaction.Category,
                            IsRecurring = transaction.IsRecurring,
                            TransactionDate =
                                transaction.TransactionDate.AddMonths(1),
                            Sender = transaction.Sender,
                            Recipient = transaction.Recipient,
                        };

                        db.Transactions.Add(newTransaction);
                    }
                    else
                    {
                        transaction.IsProcessed = true;
                    }
                }

                await db.SaveChangesAsync(ct);
            }
            catch (Exception e)
            {
                Console.WriteLine($"An unknown error occurred: {e}");
            }

            await Task.Delay(TimeSpan.FromSeconds(15), ct);
        }
    }
}
