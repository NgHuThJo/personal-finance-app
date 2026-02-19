using System.Security;
using System.Security.Claims;

namespace backend.Shared;

public class CurrentUser
{
    public int UserId { get; init; }

    public CurrentUser(IHttpContextAccessor accessor)
    {
        var currentUser = accessor?.HttpContext?.User;

        if (
            currentUser is null
            || (!currentUser?.Identity?.IsAuthenticated ?? true)
        )
        {
            throw new UnauthorizedAccessException("User is unauthenticated");
        }

        var idClaim = currentUser?.FindFirstValue("sub");

        // userId becomes int default value which is zero
        if (!int.TryParse(idClaim, out int userId))
        {
            throw new SecurityException(
                $"""UserId {userId} has invalid type"""
            );
        }

        UserId = userId;
    }
}
