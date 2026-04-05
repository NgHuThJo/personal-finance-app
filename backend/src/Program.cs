using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using backend.Src.Features;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;

// Args come from public static void main(string[] args), they are command line arguments
var builder = WebApplication.CreateBuilder(args);
var defaultJwt = builder.Configuration.GetSection("Jwt:Schemas:Bearer");

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
var assembly = typeof(Program).Assembly;
var handlerTypes = assembly
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Handler"));
var interceptorTypes = assembly
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Interceptor"));

foreach (var handlerType in handlerTypes)
{
    builder.Services.AddScoped(handlerType);
}

foreach (var interceptorType in interceptorTypes)
{
    builder.Services.AddScoped(interceptorType);
}

// Register hosted service for due transactions
builder.Services.AddHostedService<TransactionBackgroundService>();

builder.Services.AddSingleton<JwtTokenProvider>();
builder.Services.AddScoped<CurrentUser>();
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance =
            $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";
        context.ProblemDetails.Extensions.Add(
            "requestId",
            context.HttpContext.TraceIdentifier
        );
    };
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddValidatorsFromAssembly(assembly);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict;
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
    );
});
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgresConnection")
    )
);
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "DevCorsPolicy",
        policy =>
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins("https://localhost:5173");
        }
    );
});
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        ;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = defaultJwt["Issuer"],
            ValidAudience = defaultJwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(defaultJwt["SecretKey"]!)
            ),
            ClockSkew = TimeSpan.Zero,
        };
        // Use this to prevent sub claim from being mapped to legacy namespaces
        options.MapInboundClaims = false;
    })
    .AddOpenIdConnect(options =>
    {
        var oidcConfig = builder.Configuration.GetRequiredSection(
            "OpenIDConnectSettings:Google"
        );
        var googleSecretConfig = builder.Configuration.GetSection(
            "Authentication:Google"
        );

        options.Authority = oidcConfig["Authority"];
        options.ClientId = oidcConfig["ClientId"];
        options.ClientSecret = googleSecretConfig["ClientSecret"];

        options.SignInScheme =
            CookieAuthenticationDefaults.AuthenticationScheme;
        options.ResponseType = OpenIdConnectResponseType.Code;

        options.SaveTokens = true;
        options.GetClaimsFromUserInfoEndpoint = true;

        options.Scope.Add("openid");
        options.Scope.Add("profile");
        options.Scope.Add("email");

        options.MapInboundClaims = false;
        options.TokenValidationParameters.NameClaimType =
            JwtRegisteredClaimNames.Name;
        options.TokenValidationParameters.RoleClaimType = "roles";

        options.Events.OnTokenValidated = async (context) =>
        {
            var services = context.HttpContext.RequestServices;

            var db = services.GetRequiredService<AppDbContext>();
            var JwtTokenProvider =
                services.GetRequiredService<JwtTokenProvider>();

            var sub = context?.Principal?.FindFirst("sub")?.Value;
            var name = context?.Principal?.FindFirst("name")?.Value;
            var email = context?.Principal?.FindFirst("email")?.Value;

            if (
                string.IsNullOrWhiteSpace(sub)
                || string.IsNullOrWhiteSpace(name)
                || string.IsNullOrWhiteSpace(email)
            )
            {
                throw new InvalidOperationException(
                    "Required claims are missing from identity token"
                );
            }

            Console.WriteLine(db);

            var providerRecord = await db
                .UserAuthProviders.Include(p => p.User)
                .SingleOrDefaultAsync(p =>
                    p.Provider == AuthProvider.Google && p.ProviderUserId == sub
                );

            User user;

            // Create new user if not associated with a provider
            if (providerRecord is null)
            {
                user = new User
                {
                    Email = email,
                    Name = name,
                    Balance = new Balance(),
                    AuthProvider = new UserAuthProvider
                    {
                        Provider = AuthProvider.Google,
                        ProviderUserId = sub,
                    },
                };

                db.Users.Add(user);
                await db.SaveChangesAsync();
            }
            else
            {
                user = providerRecord.User;
            }

            var accessToken = JwtTokenProvider.GenerateAccessToken(user.Id);
            var refreshToken = new RefreshToken
            {
                Token = JwtTokenProvider.GenerateRefreshToken(),
                ExpiresAtUtc = DateTime.UtcNow.AddDays(7),
                UserId = user.Id,
            };

            db.RefreshTokens.Add(refreshToken);
            await db.SaveChangesAsync();

            context?.HttpContext.Response.Cookies.Append(
                "refresh_token",
                refreshToken.Token,
                new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.None,
                    Secure = true,
                    MaxAge = TimeSpan.FromDays(7),
                }
            );

            context?.HttpContext.Items["access_token"] = accessToken;
        };

        options.Events.OnTicketReceived = context =>
        {
            var jwt = (string)context.HttpContext.Items["access_token"]!;

            // context.Response.Cookies.Append(
            //     "access_token",
            //     jwt,
            //     new CookieOptions
            //     {
            //         Secure = true,
            //         SameSite = SameSiteMode.None,
            //     }
            // );

            context.Response.Redirect(
                $"https://localhost:5173/redirect/#{jwt}"
            );

            context.HandleResponse();

            return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Always handle the case where the request handled by this middleware is rejected
    options.OnRejected = async (context, token) =>
    {
        if (
            context.Lease.TryGetMetadata(
                MetadataName.RetryAfter,
                out TimeSpan retryAfter
            )
        )
        {
            context.HttpContext.Response.Headers.RetryAfter =
                $"{retryAfter.Seconds}";

            var problemDetails = ProblemDetailsHelper.Create(
                statusCode: StatusCodes.Status429TooManyRequests,
                title: "Too many requests",
                detail: $"Too many requests. Please try again after {retryAfter.Seconds} seconds."
            );

            await context.HttpContext.Response.WriteAsJsonAsync(
                problemDetails,
                cancellationToken: token
            );
        }
    };

    options.AddFixedWindowLimiter(
        "fixed",
        options =>
        {
            options.PermitLimit = 50;
            options.Window = TimeSpan.FromMinutes(1);
        }
    );

    // Use this policy throughout the app for authenticated endpoints
    // Per-user policy for authenticated users, anonymous for everyone else
    options.AddPolicy(
        "per-user",
        httpContext =>
        {
            var userId = httpContext.User.FindFirstValue("userId");

            if (!string.IsNullOrWhiteSpace(userId))
            {
                return RateLimitPartition.GetTokenBucketLimiter(
                    userId,
                    _ => new TokenBucketRateLimiterOptions
                    {
                        TokenLimit = 50,
                        TokensPerPeriod = 20,
                        ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                    }
                );
            }

            return RateLimitPartition.GetFixedWindowLimiter(
                "anonymous",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 50,
                    Window = TimeSpan.FromMinutes(1),
                }
            );
        }
    );
});

// Configure Serilog logger
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();
builder.Services.AddSerilog(Log.Logger);

var app = builder.Build();

// Use Serilog middleware, add this before any other middleware for ordering reasons
app.UseSerilogRequestLogging();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("DevCorsPolicy");
    app.MapScalarApiReference();
}
else
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseExceptionHandler();
app.UseStatusCodePages();

// Always map controllers last
app.MapUserApi()
    .MapPotApi()
    .MapAuthApi()
    .MapBalanceApi()
    .MapBudgetApi()
    .MapTransactionApi();

app.Run();
