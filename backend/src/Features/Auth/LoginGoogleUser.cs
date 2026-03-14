using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Src.Features;

public static class LoginGoogleUserEndpoint
{
    public static ChallengeHttpResult Login()
    {
        return TypedResults.Challenge(
            new AuthenticationProperties
            {
                RedirectUri = "https://localhost:5173",
            },
            [OpenIdConnectDefaults.AuthenticationScheme]
        );
    }
}
