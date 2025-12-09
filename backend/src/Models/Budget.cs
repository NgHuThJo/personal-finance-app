namespace backend.Models;

public class Budget
{
    public int Id { get; set; }
    public required decimal Maximum { get; set; }
    public required Category Category { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
