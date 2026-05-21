using backend.Src.Config;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace backend.src.Features;

static class LoginGitHubUserEndpoint
{
    public static ChallengeHttpResult LoginGitHubUser(
        [FromServices] IOptions<AppConfig> config
    )
    {
        return TypedResults.Challenge(
            new AuthenticationProperties
            {
                RedirectUri = config.Value.FrontendRedirectUrl,
            },
            ["GitHub"]
        );
    }
}
