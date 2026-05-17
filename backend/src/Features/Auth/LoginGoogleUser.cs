using backend.Src.Config;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace backend.Src.Features;

public static class LoginGoogleUserEndpoint
{
    public static ChallengeHttpResult LoginGoogleUser(
        [FromServices] IOptions<AppConfig> config
    )
    {
        return TypedResults.Challenge(
            new AuthenticationProperties
            {
                RedirectUri = config.Value.FrontendRedirectUrl,
            },
            [OpenIdConnectDefaults.AuthenticationScheme]
        );
    }
}
