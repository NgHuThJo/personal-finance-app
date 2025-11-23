namespace backend.Models;

public class Subtask
{
    public int Id { get; set; }

    public required string Description { get; set; }
    public bool IsCompleted { get; set; } = false;

    public int KanbanTaskId { get; set; }

    public KanbanTask KanbanTask { get; set; } = null!;
}
