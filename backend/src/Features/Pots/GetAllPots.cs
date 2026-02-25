using System.ComponentModel.DataAnnotations;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public record GetAllPotsResponse
{
    [Range(0, int.MaxValue)]
    public required int Id { get; init; }

    [Range(0, double.MaxValue)]
    public required decimal Total { get; init; }

    [Range(0, double.MaxValue)]
    public required decimal Target { get; init; }
}

public sealed class GetAllPotsEndpoint
{
    public static async Task<Ok<List<GetAllPotsResponse>>> GetAll(
        [FromServices] CurrentUser user,
        [FromServices] GetAllPotsHandler handler
    )
    {
        var pots = await handler.Handle(user.UserId);

        return TypedResults.Ok(pots);
    }
}

public class GetAllPotsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetAllPotsResponse>> Handle(int userId)
    {
        var pots = await _context
            .Pots.Where(p => p.UserId == userId)
            .Select(p => new GetAllPotsResponse
            {
                Id = p.Id,
                Total = p.Total,
                Target = p.Target,
            })
            .AsNoTracking()
            .ToListAsync();

        return pots;
    }
}
