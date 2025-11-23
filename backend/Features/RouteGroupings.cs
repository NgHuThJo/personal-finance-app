using backend.Features.BoardColumns;
using backend.Features.Boards;
using backend.Features.KanbanTasks;
using backend.Features.SubTasks;

namespace backend.Features;

public static class RouteGrouper
{
    public static WebApplication MapBoardApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/boards");
        group.MapPost("/", CreateBoardEndpoint.Create);
        group.MapGet("/", GetBoardsEndpoint.GetAll);
        group.MapPut("/", UpdateBoardEndpoint.Update);
        group.MapDelete("/", DeleteBoardEndpoint.Delete);

        return app;
    }

    public static WebApplication MapBoardColumnApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/boardcolumns");
        group.MapPost("/", CreateBoardColumnEndpoint.Create);

        return app;
    }

    public static WebApplication MapKanbanTaskApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/kanbantasks");
        group.MapPost("/", CreateKanbanTasksEndpoint.Create);
        group.MapGet("/", GetKanbanTasksEndpoint.GetAll);
        group.MapPut("/", UpdateKanbanTaskEndpoint.Update);
        group.MapDelete("/", DeleteKanbanTaskEndpoint.Delete);
        group.MapPut("/status", ChangeKanbanTaskStatusEndpoint.ChangeStatus);
        group.MapPut("/column", ChangeBoardColumnEndpoint.ChangeBoardColumn);

        return app;
    }

    public static WebApplication MapSubTaskApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/subtasks");
        group.MapPost("/", ToggleSubTaskStatusEndpoint.Toggle);

        return app;
    }
}
