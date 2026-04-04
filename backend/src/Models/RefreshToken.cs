namespace backend.Src.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public required string Token { get; set; }
    public DateTimeOffset ExpiresAtUtc { get; set; }
    public bool IsRevoked { get; set; } = false;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
