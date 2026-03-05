using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;

namespace backend.IntegrationTests;

public class TestAuthHandlerOptions : AuthenticationSchemeOptions
{
    public string DefaultUserId { get; set; } = null!;
}

public class TestAuthHandler(
    IOptionsMonitor<TestAuthHandlerOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder
) : AuthenticationHandler<TestAuthHandlerOptions>(options, logger, encoder)
{
    public const string UserIdHeader = "Test-Id";
    private readonly string _defaultUserId = options.CurrentValue.DefaultUserId;

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Nbf, DateTime.UtcNow.ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString()),
            new(JwtRegisteredClaimNames.Iss, "https//:localhost:5096"),
            new(JwtRegisteredClaimNames.Aud, "app://"),
        };

        if (Context.Request.Headers.TryGetValue(UserIdHeader, out var userId))
        {
            var userIdClaim = new Claim(
                JwtRegisteredClaimNames.Sub,
                userId.First() ?? _defaultUserId
            );
            claims.Add(userIdClaim);
        }
        else
        {
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, _defaultUserId));
        }

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "TestScheme");
        var result = AuthenticateResult.Success(ticket);

        return Task.FromResult(result);
    }
}
