namespace backend.Models;

public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Name { get; set; }
    public Balance Balance { get; set; } = null!;
    public List<Transaction> SentTransactions { get; set; } = [];
    public List<Transaction> ReceivedTransactions { get; set; } = [];
    public List<Budget> Budgets { get; set; } = [];
    public List<Pot> Pots { get; set; } = [];
}
