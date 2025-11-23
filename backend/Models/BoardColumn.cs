namespace backend.Models;

public class BoardColumn
{
    public int Id { get; set; }

    public required string Name { get; set; }
    public ICollection<KanbanTask> KanbanTasks { get; set; } = [];

    public int BoardId { get; set; }
    public Board Board { get; set; } = null!;
}
