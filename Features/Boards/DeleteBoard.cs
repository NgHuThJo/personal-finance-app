using System.ComponentModel.DataAnnotations;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Boards;

public record DeleteBoardRequest
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }
}

public class DeleteBoardRequestValidator : AbstractValidator<DeleteBoardRequest>
{
    public DeleteBoardRequestValidator()
    {
        RuleFor(b => b.Id).GreaterThan(0);
    }
}

public static class DeleteBoardEndpoint
{
    public static async Task<Results<ValidationProblem, NoContent>> Delete(
        [FromServices] DeleteBoardHandler handler,
        [FromServices] IValidator<DeleteBoardRequest> validator,
        [FromBody] DeleteBoardRequest command
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

public class DeleteBoardHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(DeleteBoardRequest command)
    {
        var board =
            await _context.Boards.FindAsync(command.Id)
            ?? throw new Exception(
                $"No board with id {command.Id} found in database"
            );

        _context.Boards.Remove(board);

        await _context.SaveChangesAsync();
    }
}
