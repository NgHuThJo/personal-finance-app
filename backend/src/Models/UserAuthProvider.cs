namespace backend.Src.Models;

public enum AuthProvider
{
    Google,
}

public record UserAuthProvider
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public required AuthProvider Provider { get; set; }
    public required string ProviderUserId { get; set; }
}
