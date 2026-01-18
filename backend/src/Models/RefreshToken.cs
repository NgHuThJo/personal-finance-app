namespace backend.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public required string Token { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
