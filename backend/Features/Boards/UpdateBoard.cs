using System.ComponentModel.DataAnnotations;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Shared.GlobalConstants;

namespace backend.Features.Boards;

public record UpdateBoardRequest
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Name { get; init; }
    public ICollection<UpdateBoardColumnRequest> BoardColumns { get; init; } =
        [];
}

public record UpdateBoardColumnRequest
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Name { get; init; }
}

public class UpdateBoardValidator : AbstractValidator<UpdateBoardRequest>
{
    public UpdateBoardValidator()
    {
        RuleFor(b => b.Id).GreaterThan(0);
        RuleFor(b => b.Name).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
        RuleForEach(b => b.BoardColumns)
            .SetValidator(new UpdateBoardColumnValidator());
    }
}

public class UpdateBoardColumnValidator
    : AbstractValidator<UpdateBoardColumnRequest>
{
    public UpdateBoardColumnValidator()
    {
        RuleFor(b => b.Id).GreaterThanOrEqualTo(0);
        RuleFor(b => b.Name).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
    }
}

public static class UpdateBoardEndpoint
{
    public static async Task<Results<ValidationProblem, NoContent>> Update(
        [FromServices] UpdateBoardHandler handler,
        [FromServices] IValidator<UpdateBoardRequest> validator,
        [FromBody] UpdateBoardRequest command
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

public class UpdateBoardHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(UpdateBoardRequest command)
    {
        var board =
            await _context
                .Boards.Include(b => b.BoardColumns)
                .SingleOrDefaultAsync(b => b.Id == command.Id)
            ?? throw new Exception("Board not found in database");

        board.Name = command.Name;

        var incomingBoardColumns = command
            .BoardColumns.Where(b => b.Id > 0)
            .Select(b => b.Id)
            .ToHashSet();

        board
            .BoardColumns.Where(b => !incomingBoardColumns.Contains(b.Id))
            .ToList()
            .ForEach(b => board.BoardColumns.Remove(b));

        foreach (var boardColumnDto in command.BoardColumns)
        {
            if (boardColumnDto.Id < 1)
            {
                board.BoardColumns.Add(
                    new BoardColumn { Name = boardColumnDto.Name }
                );
            }
            else
            {
                var existingBoardColumn = board.BoardColumns.Single(b =>
                    b.Id == boardColumnDto.Id
                );

                existingBoardColumn.Name = boardColumnDto.Name;
            }
        }

        await _context.SaveChangesAsync();
    }
}
