using System.Text.Json.Serialization;

namespace backend.Src.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ThemeColor
{
    Green,
    Yellow,
    Cyan,
    Navy,
    Red,
    Purple,
    Turquoise,
    Brown,
    Magenta,
    Blue,
    Grey,
    Army,
    Pink,
    YellowGreen,
    Orange,
}
