using System.ComponentModel.DataAnnotations;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Shared.GlobalConstants;

namespace backend.Features.KanbanTasks;

public record UpdateKanbanTaskRequest
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Title { get; init; }
    public required string Description { get; init; }
    public ICollection<UpdateSubtaskRequest> Subtasks { get; init; } = [];

    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; init; }
}

public record UpdateSubtaskRequest
{
    [Range(0, int.MaxValue)]
    public required int Id { get; init; }

    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Description { get; init; }
}

public record UpdateKanbanTaskResponse
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; init; }
}

public class UpdateKanbanTaskValidator
    : AbstractValidator<UpdateKanbanTaskRequest>
{
    public UpdateKanbanTaskValidator()
    {
        RuleFor(t => t.Id).GreaterThan(0);
        RuleFor(t => t.Title).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
        RuleForEach(t => t.Subtasks).SetValidator(new UpdateSubtaskValidator());
    }
}

public class UpdateSubtaskValidator : AbstractValidator<UpdateSubtaskRequest>
{
    public UpdateSubtaskValidator()
    {
        RuleFor(t => t.Id).GreaterThanOrEqualTo(0);
        RuleFor(s => s.Description).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
    }
}

public static class UpdateKanbanTaskEndpoint
{
    public static async Task<
        Results<ValidationProblem, Ok<UpdateKanbanTaskResponse>>
    > Update(
        [FromServices] UpdateKanbanTaskHandler handler,
        [FromServices] IValidator<UpdateKanbanTaskRequest> validator,
        [FromBody] UpdateKanbanTaskRequest command
    )
    {
        var validationResult = await validator.ValidateAsync(command);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(
                validationResult.ToDictionary()
            );
        }

        var updatedKanbanTask = await handler.Handle(command);

        return TypedResults.Ok(updatedKanbanTask);
    }
}

public class UpdateKanbanTaskHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<UpdateKanbanTaskResponse> Handle(
        UpdateKanbanTaskRequest command
    )
    {
        var kanbantask =
            await _context
                .KanbanTasks.Include(k => k.Subtasks)
                .SingleOrDefaultAsync(k => k.Id == command.Id)
            ?? throw new Exception("Kanban task not found in database");

        kanbantask.Title = command.Title;
        kanbantask.Description = command.Description;
        kanbantask.BoardColumnId = command.BoardColumnId;

        var incomingSubtasks = command
            .Subtasks.Where(s => s.Id > 0)
            .Select(s => s.Id)
            .ToHashSet();

        kanbantask
            .Subtasks.Where(s => !incomingSubtasks.Contains(s.Id))
            .ToList()
            .ForEach(s => kanbantask.Subtasks.Remove(s));

        foreach (var subtaskDto in command.Subtasks)
        {
            if (subtaskDto.Id < 1)
            {
                kanbantask.Subtasks.Add(
                    new Subtask { Description = subtaskDto.Description }
                );
            }
            else
            {
                var existingSubtask = kanbantask.Subtasks.Single(s =>
                    s.Id == subtaskDto.Id
                );

                existingSubtask.Description = subtaskDto.Description;
            }
        }

        await _context.SaveChangesAsync();

        return new UpdateKanbanTaskResponse
        {
            Id = kanbantask.Id,
            BoardColumnId = kanbantask.BoardColumnId,
        };
    }
}
