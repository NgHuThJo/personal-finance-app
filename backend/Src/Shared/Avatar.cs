using backend.Src.Models;

namespace backend.Src.Shared;

public static class AvatarGenerator
{
    public static string GenerateSeed()
    {
        return Guid.NewGuid().ToString();
    }

    public static AvatarStyle GetRandomStyle()
    {
        var styles = Enum.GetValues<AvatarStyle>();

        return styles[Random.Shared.Next(styles.Length)];
    }
}
