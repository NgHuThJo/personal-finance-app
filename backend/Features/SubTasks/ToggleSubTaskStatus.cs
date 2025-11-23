using System.ComponentModel.DataAnnotations;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.SubTasks;

public record ToggleSubTaskStatusRequest
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }
}

public class ToggleSubTaskStatusValidator
    : AbstractValidator<ToggleSubTaskStatusRequest>
{
    public ToggleSubTaskStatusValidator()
    {
        RuleFor(t => t.Id).GreaterThan(0);
    }
}

public static class ToggleSubTaskStatusEndpoint
{
    public static async Task<Results<ValidationProblem, NoContent>> Toggle(
        [FromServices] ToggleSubTaskStatusHandler handler,
        [FromServices] IValidator<ToggleSubTaskStatusRequest> validator,
        [FromBody] ToggleSubTaskStatusRequest command
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

public class ToggleSubTaskStatusHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(ToggleSubTaskStatusRequest command)
    {
        var subTask =
            await _context.SubTasks.FindAsync(command.Id)
            ?? throw new Exception("Subtask not found");

        subTask.IsCompleted = !subTask.IsCompleted;

        await _context.SaveChangesAsync();

        return;
    }
}
