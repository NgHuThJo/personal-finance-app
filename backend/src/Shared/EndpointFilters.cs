using FluentValidation;

namespace backend.Src.Shared;

public static partial class EndpointFilterLogger
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Route value {RouteValue} is invalid"
    )]
    public static partial void RouteValueIsInvalid(
        ILogger logger,
        string? routeValue
    );
}

public class ValidationFilter<TRequest> : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next
    )
    {
        var validation = context.HttpContext.RequestServices.GetService<
            IValidator<TRequest>
        >();

        if (validation is null)
        {
            Console.WriteLine(
                $"Validator for request type {nameof(TRequest)} could not be found"
            );
            return await next(context);
        }

        var entity = context.Arguments.OfType<TRequest>().FirstOrDefault();

        if (entity is null)
        {
            Console.WriteLine(
                $"Request object of type {nameof(TRequest)} could not be found"
            );
            return await next(context);
        }

        var validationResult = await validation.ValidateAsync(entity);

        if (!validationResult.IsValid)
        {
            Console.WriteLine($"Validation error: {validationResult.Errors}");
            return TypedResults.ValidationProblem(
                validationResult.ToDictionary()
            );
        }

        return await next(context);
    }
}

public class IdValidationFilter(ILogger<IdValidationFilter> logger)
    : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next
    )
    {
        var routeValues = context.HttpContext.Request.RouteValues;

        foreach (var (routeKey, routeValue) in routeValues)
        {
            var rawRouteValue = routeValue?.ToString();

            if (!int.TryParse(rawRouteValue, out var userId) || userId <= 0)
            {
                EndpointFilterLogger.RouteValueIsInvalid(logger, rawRouteValue);
                return TypedResults.BadRequest(
                    $"Invalid {routeKey} in {nameof(IdValidationFilter)}"
                );
            }
        }

        return await next(context);
    }
}
