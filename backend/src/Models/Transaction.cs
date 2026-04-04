using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Src.Shared;

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

public class Transaction : IHasTimestamps
{
    public int Id { get; set; }
    public required decimal Amount { get; set; }
    public DateTimeOffset Created { get; set; }
    public required DateTimeOffset TransactionDate { get; set; }
    public required bool IsRecurring { get; set; } = false;
    public bool IsProcessed { get; set; } = false;
    public required Category Category { get; set; }
    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public int RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
}
