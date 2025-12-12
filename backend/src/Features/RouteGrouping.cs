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
            .MapPost("", CreateUserEndpoint.Create)
            .AddValidationFilter<CreateUserRequest>();
        group
            .MapGet("{userId:int}", GetUserByIdEndpoint.GetById)
            .AddEndpointFilter<UserIdValidationFilter>();

        return app;
    }

    public static WebApplication MapPotApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/pots");
        group
            .MapPost("", CreatePotEndpoint.Create)
            .AddValidationFilter<CreatePotRequest>();
        group
            .MapGet("", GetAllPotsEndpoint.GetAll)
            .AddValidationFilter<GetAllPotsRequest>();

        return app;
    }
}
