namespace backend.Models;

public class Balance
{
    public int Id { get; set; }
    public decimal Current { get; set; } = 0m;
    public decimal Income { get; set; } = 0m;
    public decimal Expense { get; set; } = 0m;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
