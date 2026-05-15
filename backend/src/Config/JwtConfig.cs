namespace backend.Src.Config;

public class JwtConfig
{
    public string Issuer { get; init; } = default!;
    public string Audience { get; init; } = default!;
    public string SecretKey { get; init; } = default!;
    public int Expires { get; init; } = default!;
}
