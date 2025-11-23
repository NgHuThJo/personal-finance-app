using System.ComponentModel.DataAnnotations;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Shared.GlobalConstants;

namespace backend.Features.Boards;

public record GetBoardsResponse
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Name { get; init; }
    public required ICollection<GetBoardColumnsResponse> BoardColumns { get; init; } =
        [];
}

public record GetBoardColumnsResponse
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [StringLength(TITLE_MAX_LENGTH, MinimumLength = 1)]
    [RegularExpression(@"\S+")]
    public required string Name { get; init; }
}

public static class GetBoardsEndpoint
{
    public static async Task<Ok<List<GetBoardsResponse>>> GetAll(
        [FromServices] GetBoardsHandler handler
    )
    {
        var boards = await handler.Handle();

        return TypedResults.Ok(boards);
    }
}

public class GetBoardsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetBoardsResponse>> Handle()
    {
        var boards = await _context
            .Boards.Select(b => new GetBoardsResponse
            {
                Id = b.Id,
                Name = b.Name,
                BoardColumns = b
                    .BoardColumns.Select(bc => new GetBoardColumnsResponse
                    {
                        Id = bc.Id,
                        Name = bc.Name,
                    })
                    .ToList(),
            })
            .ToListAsync();

        return boards;
    }
}
