using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features;

public record GetAllPotsRequest
{
    public required int UserId { get; init; }
}

public record GetAllPotsResponse
{
    public required int Id { get; init; }
    public required decimal Total { get; init; }
    public required decimal Target { get; init; }
}

public class GetAllPotsValidator : AbstractValidator<GetAllPotsRequest>
{
    public GetAllPotsValidator()
    {
        RuleFor(r => r.UserId).GreaterThan(0);
    }
}

public static class GetAllPotsEndpoint
{
    public static async Task<Ok<List<GetAllPotsResponse>>> GetAll(
        [FromBody] GetAllPotsRequest query,
        [FromServices] GetAllPotsHandler handler
    )
    {
        var pots = await handler.Handle(query);

        return TypedResults.Ok(pots);
    }
}

public class GetAllPotsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetAllPotsResponse>> Handle(GetAllPotsRequest query)
    {
        var pots = await _context
            .Pots.Where(p => p.UserId == query.UserId)
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
