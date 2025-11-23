namespace backend.Models;

public class Board
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public ICollection<BoardColumn> BoardColumns { get; set; } = [];
}
