using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.src.Features;

static class LoginGitHubUserEndpoint
{
    public static ChallengeHttpResult LoginGitHubUser()
    {
        return TypedResults.Challenge(
            new AuthenticationProperties
            {
                RedirectUri = "https://localhost:5173/redirect",
            },
            ["GitHub"]
        );
    }
}
