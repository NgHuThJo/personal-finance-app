using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Shared;

public static class ProblemDetailsHelper
{
    public static ProblemDetails Create(
        HttpContext httpContext,
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
            Instance =
                instance
                ?? $"{httpContext.Request.Method} {httpContext.Request.Path}",
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
    public static ProblemHttpResult Conflict(
        HttpContext httpContext,
        string detail,
        string title = "Conflict",
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problem = ProblemDetailsHelper.Create(
            httpContext: httpContext,
            statusCode: StatusCodes.Status409Conflict,
            detail: detail,
            title: title,
            type: type,
            instance: instance,
            extensions: extensions
        );

        return TypedResults.Problem(problem);
    }

    public static ProblemHttpResult NotFound(
        HttpContext httpContext,
        string detail,
        string title = "Not Found",
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problem = ProblemDetailsHelper.Create(
            httpContext: httpContext,
            statusCode: StatusCodes.Status404NotFound,
            detail: detail,
            title: title,
            type: type,
            instance: instance,
            extensions: extensions
        );

        return TypedResults.Problem(problem);
    }

    public static ProblemHttpResult BadRequest(
        HttpContext httpContext,
        string detail,
        string title = "Bad Request",
        string? type = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null
    )
    {
        var problem = ProblemDetailsHelper.Create(
            httpContext: httpContext,
            statusCode: StatusCodes.Status400BadRequest,
            detail: detail,
            title: title,
            type: type,
            instance: instance,
            extensions: extensions
        );

        return TypedResults.Problem(problem);
    }
}
