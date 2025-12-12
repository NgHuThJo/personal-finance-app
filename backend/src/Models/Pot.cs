namespace backend.Models;

public class Pot
{
    public int Id { get; set; }
    public decimal Total { get; set; } = 0m;
    public required decimal Target { get; set; }
    public required string Name { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
