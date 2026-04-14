using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Src.Models;

// public class CamelCaseEnumConverter : JsonStringEnumConverter

// {
//     public CamelCaseEnumConverter()
//         : base(JsonNamingPolicy.CamelCase) { }
// }

[JsonConverter(typeof(JsonStringEnumConverter))]
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
