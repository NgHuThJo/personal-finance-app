using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Shared;

public static class ProblemDetailsHelper
{
    public static ProblemDetails Create(
        int statusCode,
        string title,
        string detail,
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Type = type,
            Instance = instance,
        };

        if (extensions is not null)
        {
            problemDetails.Extensions = extensions;
        }

        return problemDetails;
    }
}

public static class TypedResultsProblemDetails
{
    public static ProblemHttpResult BadRequest(
        string detail,
        string title = "Bad Request",
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problem = ProblemDetailsHelper.Create(
            statusCode: StatusCodes.Status400BadRequest,
            detail: detail,
            title: title,
            type: type,
            instance: instance,
            extensions: extensions
        );

        return TypedResults.Problem(problem);
    }

    public static ProblemHttpResult Unauthorized(
        string detail,
        string title = "Unauthorized",
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problem = ProblemDetailsHelper.Create(
            statusCode: StatusCodes.Status401Unauthorized,
            detail: detail,
            title: title,
            type: type,
            instance: instance,
            extensions: extensions
        );

        return TypedResults.Problem(problem);
    }

    public static ProblemHttpResult Forbidden(
        string detail,
        string title = "Forbidden",
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problem = ProblemDetailsHelper.Create(
            statusCode: StatusCodes.Status403Forbidden,
            detail: detail,
            title: title,
            type: type,
            instance: instance,
            extensions: extensions
        );

        return TypedResults.Problem(problem);
    }

    public static ProblemHttpResult NotFound(
        string detail,
        string title = "Not Found",
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problem = ProblemDetailsHelper.Create(
            statusCode: StatusCodes.Status404NotFound,
            detail: detail,
            title: title,
            type: type,
            instance: instance,
            extensions: extensions
        );

        return TypedResults.Problem(problem);
    }

    public static ProblemHttpResult Conflict(
        string detail,
        string title = "Conflict",
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problem = ProblemDetailsHelper.Create(
            statusCode: StatusCodes.Status409Conflict,
            detail: detail,
            title: title,
            type: type,
            instance: instance,
            extensions: extensions
        );

        return TypedResults.Problem(problem);
    }
}
