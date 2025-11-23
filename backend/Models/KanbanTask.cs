namespace backend.Models;

public class KanbanTask
{
    public int Id { get; set; }

    public required string Title { get; set; }

    public string Description { get; set; } = "";

    public ICollection<Subtask> Subtasks { get; set; } = [];
    public int BoardColumnId { get; set; }
    public BoardColumn BoardColumn { get; set; } = null!;
}
