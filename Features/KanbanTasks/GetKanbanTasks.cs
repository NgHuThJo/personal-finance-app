using System.ComponentModel.DataAnnotations;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Shared.GlobalConstants;

namespace backend.Features.KanbanTasks;

public record GetKanbanTasksRequest
{
    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; set; }
}

public record GetKanbanTasksResponse
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Title { get; init; }
    public required string Description { get; init; }
    public ICollection<GetSubtasksResponse> SubTasks { get; init; } = [];

    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; init; }
}

public record GetSubtasksResponse
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }
    public required string Description { get; init; }
    public required bool IsCompleted { get; init; }

    [Range(1, int.MaxValue)]
    public required int KanbanTaskId { get; init; }
}

public class GetKanbanTasksRequestValidator
    : AbstractValidator<GetKanbanTasksRequest>
{
    public GetKanbanTasksRequestValidator()
    {
        RuleFor(task => task.BoardColumnId).GreaterThan(1);
    }
}

public static class GetKanbanTasksEndpoint
{
    public static async Task<
        Results<ValidationProblem, Ok<List<GetKanbanTasksResponse>>>
    > GetAll(
        [FromServices] GetKanbanTasksHandler handler,
        [FromServices] IValidator<GetKanbanTasksRequest> validator,
        [AsParameters] GetKanbanTasksRequest query
    )
    {
        var validationResult = await validator.ValidateAsync(query);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(
                validationResult.ToDictionary()
            );
        }

        var kanbanTasks = await handler.Handle(query);

        return TypedResults.Ok(kanbanTasks);
    }
}

public class GetKanbanTasksHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetKanbanTasksResponse>> Handle(
        GetKanbanTasksRequest query
    )
    {
        var kanbanTasks = await _context
            .KanbanTasks.Where(t => t.BoardColumnId == query.BoardColumnId)
            .Select(t => new GetKanbanTasksResponse
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                BoardColumnId = t.BoardColumnId,
                SubTasks = t
                    .Subtasks.Select(s => new GetSubtasksResponse
                    {
                        Id = s.Id,
                        Description = s.Description,
                        IsCompleted = s.IsCompleted,
                        KanbanTaskId = s.KanbanTaskId,
                    })
                    .ToList(),
            })
            .ToListAsync();

        return kanbanTasks;
    }
}
