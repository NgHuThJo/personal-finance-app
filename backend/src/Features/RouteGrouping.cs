using System.Net;
using backend.Src.Shared;

namespace backend.Src.Features;

public static class RouteGrouper
{
    private static RouteHandlerBuilder AddValidationFilter<T>(
        this RouteHandlerBuilder builder
    )
    {
        return builder.AddEndpointFilter<ValidationFilter<T>>();
    }

    private static RouteHandlerBuilder AddIdValidationFilter(
        this RouteHandlerBuilder builder
    )
    {
        return builder.AddEndpointFilter<IdValidationFilter>();
    }

    /* User */
    public static WebApplication MapUserApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/users");
        group.RequireAuthorization().RequireRateLimiting("per-user");
        group
            .MapGet("", GetUserByIdEndpoint.GetById)
            .WithName("GetUserById")
            .ProducesProblem((int)HttpStatusCode.NotFound);

        return app;
    }

    /* Balance */
    public static WebApplication MapBalanceApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/balances");
        group.RequireAuthorization().RequireRateLimiting("per-user");
        group
            .MapGet("", GetBalanceByIdEndpoint.Get)
            .WithName("GetBalanceById")
            .ProducesProblem((int)HttpStatusCode.Unauthorized);

        return app;
    }

    /* Pot */
    public static WebApplication MapPotApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/pots");
        group.RequireAuthorization().RequireRateLimiting("per-user");
        group
            .MapPost("", CreatePotEndpoint.Create)
            .WithName("CreatePot")
            .AddValidationFilter<CreatePotRequest>()
            .ProducesProblem((int)HttpStatusCode.BadRequest);
        group.MapGet("", GetAllPotsEndpoint.GetAll).WithName("GetAllPots");
        group
            .MapPatch(
                "/{potId:int}/money-withdrawal",
                WithdrawMoneyFromPotEndpoint.Withdraw
            )
            .WithName("WithdrawMoneyFromPot")
            .AddIdValidationFilter()
            .AddValidationFilter<WithdrawMoneyFromPotRequest>()
            .ProducesProblem((int)HttpStatusCode.UnprocessableEntity);
        group
            .MapPatch("/{potId:int}/money-addition", AddMoneyToPotEndpoint.Add)
            .WithName("AddMoneyToPot")
            .AddIdValidationFilter()
            .AddValidationFilter<AddMoneyToPotRequest>();

        return app;
    }

    /* Auth */
    public static WebApplication MapAuthApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/auth");
        group.RequireRateLimiting("fixed");
        group
            .MapPost("signup", SignUpUserEndpoint.Create)
            .WithName("SignUpUser")
            .AddValidationFilter<SignUpUserRequest>()
            .ProducesProblem((int)HttpStatusCode.Conflict);
        group
            .MapPost("login", LoginUserEndpoint.Login)
            .WithName("LoginUser")
            .AddValidationFilter<LoginUserRequest>()
            .ProducesProblem((int)HttpStatusCode.Conflict)
            .ProducesProblem((int)HttpStatusCode.Unauthorized);
        group
            .MapPost("logout", LogoutUserEndpoint.Logout)
            .WithName("LogoutUser")
            .ProducesProblem((int)HttpStatusCode.Forbidden);
        group
            .MapGet("refresh", CreateRefreshTokenEndpoint.Get)
            .WithName("CreateRefreshToken")
            .ProducesProblem((int)HttpStatusCode.Unauthorized);

        group
            .MapGet("login/google", LoginGoogleUserEndpoint.Login)
            .WithName("LoginGoogleUser")
            .WithSummary("Redirects to Google login");
        group
            .MapPost("logout/google", LogoutGoogleUserEndpoint.Logout)
            .WithName("LogoutGoogleUser");

        return app;
    }
}
