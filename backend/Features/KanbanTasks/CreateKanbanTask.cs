using System.ComponentModel.DataAnnotations;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Shared.GlobalConstants;

namespace backend.Features.KanbanTasks;

public record CreateKanbanTaskRequest
{
    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Title { get; init; }

    public required string Description { get; init; }

    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; init; }
    public ICollection<CreateSubtaskRequest> Subtasks { get; init; } = [];
}

public record CreateSubtaskRequest
{
    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Description { get; init; }
}

public record CreateKanbanTaskResponse
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; init; }
}

public class CreateKanbanTaskRequestValidator
    : AbstractValidator<CreateKanbanTaskRequest>
{
    public CreateKanbanTaskRequestValidator()
    {
        RuleFor(t => t.Title).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
        RuleFor(t => t.Description).NotEmpty();
        RuleFor(t => t.BoardColumnId).GreaterThan(0);
        RuleForEach(b => b.Subtasks)
            .SetValidator(new CreateSubtaskRequestValidator());
    }
}

public class CreateSubtaskRequestValidator
    : AbstractValidator<CreateSubtaskRequest>
{
    public CreateSubtaskRequestValidator()
    {
        RuleFor(s => s.Description).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
    }
}

public static class CreateKanbanTasksEndpoint
{
    public static async Task<
        Results<
            ValidationProblem,
            Created<CreateKanbanTaskResponse>,
            ProblemHttpResult
        >
    > Create(
        HttpContext httpContext,
        [FromServices] CreateKanbanTaskHandler handler,
        [FromServices] IValidator<CreateKanbanTaskRequest> validator,
        [FromBody] CreateKanbanTaskRequest command
    )
    {
        var validationResult = await validator.ValidateAsync(command);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(
                validationResult.ToDictionary()
            );
        }

        try
        {
            var newKanbanTaskId = await handler.Handle(command);

            return TypedResults.Created(
                $"/api/kanbantasks/{newKanbanTaskId.Id}",
                newKanbanTaskId
            );
        }
        catch (KeyNotFoundException ex)
        {
            return TypedResultsProblemDetails.NotFound(
                httpContext: httpContext,
                detail: ex.Message,
                type: ex.GetType().Name
            );
        }
    }
}

public class CreateKanbanTaskHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<CreateKanbanTaskResponse> Handle(
        CreateKanbanTaskRequest command
    )
    {
        var boardColumn =
            await _context.BoardColumns.FindAsync(command.BoardColumnId)
            ?? throw new KeyNotFoundException("Board column not found");

        var kanbanTask = new KanbanTask
        {
            Title = command.Title,
            Description = command.Description,
            BoardColumn = boardColumn,
            Subtasks =
            [
                .. command.Subtasks.Select(s => new Subtask
                {
                    Description = s.Description,
                }),
            ],
        };

        _context.KanbanTasks.Add(kanbanTask);
        await _context.SaveChangesAsync();

        return new CreateKanbanTaskResponse
        {
            Id = kanbanTask.Id,
            BoardColumnId = kanbanTask.BoardColumnId,
        };
    }
}
