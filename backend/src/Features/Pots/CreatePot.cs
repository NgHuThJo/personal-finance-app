using System.ComponentModel.DataAnnotations;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features;

public record CreatePotRequest
{
    [Range(0, double.MaxValue)]
    public required decimal Target { get; init; }

    [MinLength(1)]
    public required string Name { get; init; }
}

public record CreatePotResponse
{
    [Range(0, int.MaxValue)]
    public required int Id { get; init; }

    [Range(0, double.MaxValue)]
    public required decimal Total { get; init; }

    [Range(0, double.MaxValue)]
    public required decimal Target { get; init; }

    [MinLength(1)]
    public required string Name { get; init; }
}

public class CreatePotValidator : AbstractValidator<CreatePotRequest>
{
    public CreatePotValidator()
    {
        RuleFor(p => p.Target).GreaterThanOrEqualTo(0);
        RuleFor(p => p.Name).MinimumLength(1);
    }
}

public sealed class CreatePotEndpoint
{
    public static async Task<Created<CreatePotResponse>> Create(
        [FromBody] CreatePotRequest command,
        [FromServices] CurrentUser user,
        [FromServices] CreatePotHandler handler
    )
    {
        var newPot = await handler.Handle(command, user.UserId);

        return TypedResults.Created($"/api/pots/{newPot.Id}", newPot);
    }
}

public class CreatePotHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<CreatePotResponse> Handle(
        CreatePotRequest command,
        int userId
    )
    {
        var newPot = new Pot
        {
            Target = command.Target,
            Name = command.Name,
            UserId = userId,
        };

        _context.Pots.Add(newPot);

        await _context.SaveChangesAsync();

        return new CreatePotResponse
        {
            Id = newPot.Id,
            Target = newPot.Target,
            Total = newPot.Total,
            Name = newPot.Name,
        };
    }
}
