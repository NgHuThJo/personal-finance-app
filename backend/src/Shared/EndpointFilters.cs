using FluentValidation;

namespace backend.Shared;

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

public class UserIdValidationFilter(ILogger<UserIdValidationFilter> logger)
    : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next
    )
    {
        var rawRouteValue = context
            .HttpContext.Request.RouteValues["userId"]
            ?.ToString();

        if (!int.TryParse(rawRouteValue, out var userId) || userId <= 0)
        {
            EndpointFilterLogger.RouteValueIsInvalid(logger, rawRouteValue);
            return TypedResults.BadRequest("Invalid userId");
        }

        return await next(context);
    }
}
