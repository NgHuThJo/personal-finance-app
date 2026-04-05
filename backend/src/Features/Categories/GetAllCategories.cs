using backend.Src.Models;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Src.Features;

public static class GetAllCategoriesEndpoint
{
    public static Ok<Category[]> GetAllCategories()
    {
        var categories = Enum.GetValues<Category>();

        return TypedResults.Ok(categories);
    }
}
