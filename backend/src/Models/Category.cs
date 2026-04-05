using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Src.Models;

public class CamelCaseEnumConverter<T> : JsonStringEnumConverter
    where T : Enum
{
    public CamelCaseEnumConverter()
        : base(JsonNamingPolicy.CamelCase) { }
}

[JsonConverter(typeof(CamelCaseEnumConverter<Category>))]
public enum Category
{
    Entertainment,
    Bills,
    Groceries,
    Transportation,
    Education,
    Lifestyle,
    Shopping,
    General,
}
