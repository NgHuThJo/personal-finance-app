namespace backend.Models;

public class Balance
{
    public int Id { get; set; }
    public double Current { get; set; } = 0d;
    public double Income { get; set; } = 0d;
    public double Expense { get; set; } = 0d;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
