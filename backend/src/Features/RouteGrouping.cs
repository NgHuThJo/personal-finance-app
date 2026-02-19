using System.Net;
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

    /* User */
    public static WebApplication MapUserApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/users");
        group.RequireAuthorization();
        group
            .MapGet("", GetUserByIdEndpoint.GetById)
            .ProducesProblem((int)HttpStatusCode.NotFound);

        return app;
    }

    /* Balance */
    public static WebApplication MapBalanceApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/balances");
        group.RequireAuthorization();
        group
            .MapGet("", GetBalanceByIdEndpoint.Get)
            .ProducesProblem((int)HttpStatusCode.Unauthorized);

        return app;
    }

    /* Pot */
    public static WebApplication MapPotApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/pots");
        group.RequireAuthorization();
        group
            .MapPost("", CreatePotEndpoint.Create)
            .AddValidationFilter<CreatePotRequest>();
        group
            .MapGet("", GetAllPotsEndpoint.GetAll)
            .AddValidationFilter<GetAllPotsRequest>();

        return app;
    }

    /* Auth */
    public static WebApplication MapAuthApi(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");
        group
            .MapPost("signup", SignUpUserEndpoint.Create)
            .ProducesProblem((int)HttpStatusCode.Conflict)
            .AddValidationFilter<SignUpUserRequest>();
        group
            .MapPost("login", LoginUserEndpoint.Login)
            .ProducesProblem((int)HttpStatusCode.Conflict)
            .ProducesProblem((int)HttpStatusCode.Unauthorized)
            .AddValidationFilter<LoginUserRequest>();
        group
            .MapPost("logout", LogoutUserEndpoint.Logout)
            .ProducesProblem((int)HttpStatusCode.Forbidden);
        group
            .MapGet("refresh", CreateRefreshTokenEndpoint.Get)
            .ProducesProblem((int)HttpStatusCode.Unauthorized);

        return app;
    }
}
