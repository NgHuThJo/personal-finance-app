using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using backend.Features;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
var defaultJwt = builder.Configuration.GetSection("Jwt:Schemas:Bearer");

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
var assembly = typeof(Program).Assembly;
var handlerTypes = assembly
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Handler"));
var intercepterTypes = assembly
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Interceptor"));

foreach (var handlerType in handlerTypes)
{
    builder.Services.AddScoped(handlerType);
}

foreach (var interceptorType in intercepterTypes)
{
    builder.Services.AddScoped(interceptorType);
}

// Register JwtTokenProvider
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
    .Services.AddAuthentication()
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
            options.PermitLimit = 5;
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
                        TokenLimit = 5,
                        TokensPerPeriod = 2,
                        ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                    }
                );
            }

            return RateLimitPartition.GetFixedWindowLimiter(
                "anonymous",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
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

app.MapUserApi().MapPotApi().MapAuthApi().MapBalanceApi();

app.Run();
