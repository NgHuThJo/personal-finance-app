using System.Text.Json.Serialization;

namespace backend.Src.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AvatarStyle
{
    Adventurer,
    Bottts,
    Lorelei,
    Pixel_Art,
}
