using backend.Shared;

namespace backend.Features;

public static class RouteGrouper
{
    private static RouteHandlerBuilder AddValidationFilter<T>(
        this RouteHandlerBuilder builder
    )
    {
        return builder.AddEndpointFilter<ValidationFilter<T>>();
    }

    public static WebApplication MapUserApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/users");
        group
            .MapPost("/", CreateUserEndpoint.Create)
            .AddValidationFilter<CreateUserRequest>();

        return app;
    }
}
