namespace backend.Models;

public class Pot
{
    public int Id { get; set; }
    public required decimal Total { get; set; }
    public required decimal Target { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
