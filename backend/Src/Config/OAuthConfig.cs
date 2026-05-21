namespace backend.Src.Config;

public interface IOAuthConfig
{
    public string ClientId { get; init; }
    public string ClientSecret { get; init; }
    public string Authority { get; init; }
}

public class GoogleOAuthConfig : IOAuthConfig
{
    public string ClientId { get; init; } = default!;
    public string ClientSecret { get; init; } = default!;
    public string Authority { get; init; } = default!;
}

public class GitHubOAuthConfig : IOAuthConfig
{
    public string ClientId { get; init; } = default!;
    public string ClientSecret { get; init; } = default!;
    public string Authority { get; init; } = default!;
}
