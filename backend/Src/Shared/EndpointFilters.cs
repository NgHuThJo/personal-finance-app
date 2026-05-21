using FluentValidation;
using FluentValidation.Results;

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

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Request payload of type {RequestType} could not be found"
    )]
    public static partial void RequestPayloadNotFound(
        ILogger logger,
        string requestType
    );

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Validation failed for {RequestType}: {@Errors}"
    )]
    public static partial void ValidationFailed(
        ILogger logger,
        string requestType,
        List<ValidationFailure> errors
    );
}

public class ValidationFilter<TRequest>(
    IValidator<TRequest> validator,
    ILogger<ValidationFilter<TRequest>> logger
) : IEndpointFilter
{
    private readonly ILogger<ValidationFilter<TRequest>> _logger = logger;

    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next
    )
    {
        var entity = context.Arguments.OfType<TRequest>().SingleOrDefault();

        if (entity is null)
        {
            EndpointFilterLogger.RequestPayloadNotFound(
                _logger,
                typeof(TRequest).Name
            );
            throw new InvalidOperationException(
                $"Validator for request type {typeof(TRequest).Name} could not be found"
            );
        }

        var validationResult = await validator.ValidateAsync(entity);

        if (!validationResult.IsValid)
        {
            EndpointFilterLogger.ValidationFailed(
                _logger,
                typeof(TRequest).Name,
                validationResult.Errors
            );
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
