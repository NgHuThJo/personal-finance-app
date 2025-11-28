namespace backend.Models;

public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public string? Name { get; set; }
    public Balance Balance { get; set; } = null!;
}
