using backend.Shared;

namespace backend.Models;

public enum Category
{
    Entertainment,
    Bills,
    Groceries,
    Transportation,
    Education,
    Lifestyle,
    Shopping,
    General,
}

public class Transaction : IHasTimestamps
{
    public int Id { get; set; }
    public required decimal Amount { get; set; }
    public DateTime Created { get; set; }
    public required DateTime TransactionDate { get; set; }
    public required bool IsRecurring { get; set; }
    public required Category Category { get; set; }
    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public int RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
}
