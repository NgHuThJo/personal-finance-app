using backend.Src.Models;

namespace backend.Shared.Test;

public static class RefreshTokenBuilder
{
    public static TestState WithRefreshToken(
        this TestState state,
        Action<RefreshToken> configure,
        out RefreshToken refreshToken,
        User? user = null
    )
    {
        var newRefreshToken = RefreshTokenFaker
            .RefreshTokenForTesting()
            .Generate();
        configure(newRefreshToken);
        newRefreshToken.User = user ?? state.DefaultUser;
        state.Context.RefreshTokens.Add(newRefreshToken);

        refreshToken = newRefreshToken;

        return state;
    }
}
