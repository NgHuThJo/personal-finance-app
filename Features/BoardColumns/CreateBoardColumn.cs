using System.ComponentModel.DataAnnotations;
using System.Data;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Shared.GlobalConstants;

namespace backend.Features.BoardColumns;

public record CreateBoardColumnRequest
{
    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Name { get; init; }

    [Range(1, int.MaxValue)]
    public required int BoardId { get; init; }
}

public record CreateBoardColumnResponse
{
    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; init; }
}

public class CreateBoardRequestValidator
    : AbstractValidator<CreateBoardColumnRequest>
{
    public CreateBoardRequestValidator()
    {
        RuleFor(b => b.Name).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
        RuleFor(b => b.BoardId).GreaterThan(0);
    }
}

public static class CreateBoardColumnEndpoint
{
    public static async Task<
        Results<
            ValidationProblem,
            Created<CreateBoardColumnResponse>,
            ProblemHttpResult
        >
    > Create(
        HttpContext httpContext,
        [FromServices] CreateBoardColumnHandler handler,
        [FromServices] IValidator<CreateBoardColumnRequest> validator,
        [FromBody] CreateBoardColumnRequest command
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
            var newBoardColumnId = await handler.Handle(command);

            return TypedResults.Created(
                $"/api/boards/{newBoardColumnId.BoardColumnId}",
                newBoardColumnId
            );
        }
        catch (DuplicateNameException ex)
        {
            return TypedResultsProblemDetails.Conflict(
                httpContext: httpContext,
                detail: ex.Message,
                type: ex.GetType().Name
            );
        }
    }
}

public class CreateBoardColumnHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<CreateBoardColumnResponse> Handle(
        CreateBoardColumnRequest command
    )
    {
        var nameInDb = await _context
            .BoardColumns.Where(b =>
                b.BoardId == command.BoardId && b.Name == command.Name
            )
            .FirstOrDefaultAsync();

        if (nameInDb is not null)
        {
            throw new DuplicateNameException(
                $"Board column name \"{command.Name}\" is already in database"
            );
        }

        var boardColumn = new BoardColumn
        {
            Name = command.Name,
            BoardId = command.BoardId,
        };

        _context.Add(boardColumn);

        await _context.SaveChangesAsync();

        return new CreateBoardColumnResponse { BoardColumnId = boardColumn.Id };
    }
}
