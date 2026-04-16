using backend.Src.Models;

public static class FakerExtensions
{
    public static Category GetRandomCategory()
    {
        var categoryValue = Enum.GetValues<Category>();
        var random = new Random();

        return categoryValue[random.Next(categoryValue.Length)];
    }

    public static ThemeColor GetRandomThemeColor()
    {
        var themeColorValue = Enum.GetValues<ThemeColor>();
        var random = new Random();

        return themeColorValue[random.Next(themeColorValue.Length)];
    }
}
