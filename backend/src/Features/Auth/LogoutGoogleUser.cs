using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Src.Features;

public static class LogoutGoogleUserEndpoint
{
    public static async Task<RedirectHttpResult> Logout(
        HttpContext httpContext,
        CancellationToken _
    )
    {
        await httpContext.SignOutAsync();
        return TypedResults.Redirect("/");
    }
}
