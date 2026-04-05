using backend.Src.Shared;

namespace backend.Src.Models;

public class Transaction : IHasTimestamps
{
    public int Id { get; set; }
    public required decimal Amount { get; set; }
    public DateTimeOffset Created { get; set; }
    public required DateTimeOffset TransactionDate { get; set; }
    public required bool IsRecurring { get; set; } = false;
    public bool IsProcessed { get; set; } = false;
    public required Category Category { get; set; }
    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public int RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
}
