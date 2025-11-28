using System.ComponentModel.DataAnnotations;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.KanbanTasks;

public record DeleteKanbanTaskRequest
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }
}

public class DeleteKanbanTaskValidator
    : AbstractValidator<DeleteKanbanTaskRequest>
{
    public DeleteKanbanTaskValidator()
    {
        RuleFor(k => k.Id).GreaterThan(0);
    }
}

public static class DeleteKanbanTaskEndpoint
{
    public static async Task<Results<ValidationProblem, NoContent>> Delete(
        [FromServices] DeleteKanbanTaskHandler handler,
        [FromServices] IValidator<DeleteKanbanTaskRequest> validator,
        [FromBody] DeleteKanbanTaskRequest command
    )
    {
        var validationResult = await validator.ValidateAsync(command);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(
                validationResult.ToDictionary()
            );
        }

        await handler.Handle(command);

        return TypedResults.NoContent();
    }
}

public class DeleteKanbanTaskHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(DeleteKanbanTaskRequest command)
    {
        var task =
            await _context.KanbanTasks.FindAsync(command.Id)
            ?? throw new Exception(
                $"Task with id {command.Id} not found in database"
            );

        _context.KanbanTasks.Remove(task);

        await _context.SaveChangesAsync();
    }
}
