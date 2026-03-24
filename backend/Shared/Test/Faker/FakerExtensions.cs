using backend.Src.Models;

public static class FakerExtensions
{
    public static Category GetRandomCategory()
    {
        var categoryValue = Enum.GetValues<Category>();
        var random = new Random();

        return categoryValue[random.Next(categoryValue.Length)];
    }
}
