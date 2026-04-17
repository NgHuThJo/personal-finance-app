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
            .MapGet("", GetUserByIdEndpoint.GetUserById)
            .WithName(nameof(GetUserByIdEndpoint.GetUserById))
            .ProducesProblem((int)HttpStatusCode.NotFound);

        return app;
    }

    /* Balance */
    public static WebApplication MapBalanceApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/balances");
        group.RequireAuthorization().RequireRateLimiting("per-user");
        group
            .MapGet("/me", GetBalanceByUserIdEndpoint.GetBalanceByUserId)
            .WithName(nameof(GetBalanceByUserIdEndpoint.GetBalanceByUserId))
            .ProducesProblem((int)HttpStatusCode.Unauthorized);

        return app;
    }

    /* Pot */
    public static WebApplication MapPotApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/pots");
        group.RequireAuthorization().RequireRateLimiting("per-user");
        group
            .MapPost("", CreatePotEndpoint.CreatePot)
            .WithName(nameof(CreatePotEndpoint.CreatePot))
            .AddValidationFilter<CreatePotRequest>()
            .ProducesProblem((int)HttpStatusCode.BadRequest);
        group
            .MapGet("", GetAllPotsEndpoint.GetAllPots)
            .WithName(nameof(GetAllPotsEndpoint.GetAllPots));
        group
            .MapDelete("/{potId:int}", DeletePotEndpoint.DeletePot)
            .WithName(nameof(DeletePotEndpoint.DeletePot))
            .AddIdValidationFilter()
            .ProducesProblem((int)HttpStatusCode.UnprocessableEntity);
        group
            .MapPut("/{potId:int}", EditPotEndpoint.EditPot)
            .WithName(nameof(EditPotEndpoint.EditPot))
            .AddIdValidationFilter()
            .ProducesProblem((int)HttpStatusCode.Conflict)
            .ProducesProblem((int)HttpStatusCode.UnprocessableEntity);
        group
            .MapPatch(
                "/{potId:int}/withdrawal",
                WithdrawMoneyFromPotEndpoint.WithdrawMoneyFromPot
            )
            .WithName(nameof(WithdrawMoneyFromPotEndpoint.WithdrawMoneyFromPot))
            .AddIdValidationFilter()
            .AddValidationFilter<WithdrawMoneyFromPotRequest>()
            .ProducesProblem((int)HttpStatusCode.UnprocessableEntity);
        group
            .MapPatch(
                "/{potId:int}/addition",
                AddMoneyToPotEndpoint.AddMoneyToPot
            )
            .WithName(nameof(AddMoneyToPotEndpoint.AddMoneyToPot))
            .AddIdValidationFilter()
            .AddValidationFilter<AddMoneyToPotRequest>()
            .ProducesProblem((int)HttpStatusCode.UnprocessableEntity);

        return app;
    }

    /* Budget */
    public static WebApplication MapBudgetApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/budgets");
        group.RequireAuthorization().RequireRateLimiting("per-user");
        group
            .MapGet("", GetAllBudgetsEndpoint.GetAllBudgets)
            .WithName(nameof(GetAllBudgetsEndpoint.GetAllBudgets))
            .ProducesProblem((int)HttpStatusCode.Unauthorized);
        group
            .MapPost("", CreateBudgetEndpoint.CreateBudget)
            .WithName(nameof(CreateBudgetEndpoint.CreateBudget))
            .AddValidationFilter<CreateBudgetRequest>()
            .ProducesProblem((int)HttpStatusCode.Unauthorized)
            .ProducesProblem((int)HttpStatusCode.BadRequest);
        group
            .MapPut("/{budgetId:int}", EditBudgetEndpoint.EditBudget)
            .WithName(nameof(EditBudgetEndpoint.EditBudget))
            .AddIdValidationFilter()
            .AddValidationFilter<EditBudgetRequest>()
            .ProducesProblem((int)HttpStatusCode.Unauthorized);
        group
            .MapDelete("/{budgetId:int}", DeleteBudgetEndpoint.DeleteBudget)
            .WithName(nameof(DeleteBudgetEndpoint.DeleteBudget))
            .AddIdValidationFilter()
            .ProducesProblem((int)HttpStatusCode.Unauthorized);

        return app;
    }

    /* Transaction */
    public static WebApplication MapTransactionApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/transactions");
        group.RequireAuthorization().RequireRateLimiting("per-user");
        group
            .MapGet("", GetAllTransactionsEndpoint.GetAllTransactions)
            .WithName(nameof(GetAllTransactionsEndpoint.GetAllTransactions))
            .AddValidationFilter<GetAllTransactionsSearchParams>()
            .ProducesProblem((int)HttpStatusCode.Unauthorized);
        group
            .MapGet("/bills", GetAllRecurringBillsEndpoint.GetAllRecurringBills)
            .WithName(nameof(GetAllRecurringBillsEndpoint.GetAllRecurringBills))
            .AddValidationFilter<GetAllRecurringBillsSearchParams>()
            .ProducesProblem((int)HttpStatusCode.Unauthorized);
        group
            .MapPost("", CreateTransactionEndpoint.CreateTransaction)
            .WithName(nameof(CreateTransactionEndpoint.CreateTransaction))
            .AddValidationFilter<CreateTransactionRequest>()
            .ProducesProblem((int)HttpStatusCode.BadRequest)
            .ProducesValidationProblem((int)HttpStatusCode.BadRequest)
            .ProducesProblem((int)HttpStatusCode.UnprocessableContent);

        return app;
    }

    /* Category */
    public static WebApplication MapCategoryApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/categories");
        group.RequireAuthorization().RequireRateLimiting("per-user");
        group
            .MapGet("", GetAllCategoriesEndpoint.GetAllCategories)
            .WithName(nameof(GetAllCategoriesEndpoint.GetAllCategories))
            .ProducesProblem((int)HttpStatusCode.Unauthorized);

        return app;
    }

    /* Auth */
    public static WebApplication MapAuthApi(this WebApplication app)
    {
        var group = app.MapGroup("/v1/auth");
        group.RequireRateLimiting("fixed");
        group
            .MapPost("signup", SignUpUserEndpoint.SignUpUser)
            .WithName(nameof(SignUpUserEndpoint.SignUpUser))
            .AddValidationFilter<SignUpUserRequest>()
            .ProducesProblem((int)HttpStatusCode.Conflict);
        group
            .MapPost("login", LoginUserEndpoint.LoginUser)
            .WithName(nameof(LoginUserEndpoint.LoginUser))
            .AddValidationFilter<LoginUserRequest>()
            .ProducesProblem((int)HttpStatusCode.Conflict)
            .ProducesProblem((int)HttpStatusCode.Unauthorized);
        group
            .MapPost("logout", LogoutUserEndpoint.LogoutUser)
            .WithName(nameof(LogoutUserEndpoint.LogoutUser))
            .ProducesProblem((int)HttpStatusCode.Forbidden);
        group
            .MapGet("refresh", CreateRefreshTokenEndpoint.CreateRefreshToken)
            .WithName(nameof(CreateRefreshTokenEndpoint.CreateRefreshToken))
            .ProducesProblem((int)HttpStatusCode.Unauthorized);

        group
            .MapGet("login/google", LoginGoogleUserEndpoint.LoginGoogleUser)
            .WithName(nameof(LoginGoogleUserEndpoint.LoginGoogleUser))
            .WithSummary("Redirects to Google login");
        group
            .MapPost("logout/google", LogoutGoogleUserEndpoint.LogoutGoogleUser)
            .WithName(nameof(LogoutGoogleUserEndpoint.LogoutGoogleUser));

        return app;
    }
}
