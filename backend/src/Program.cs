using System.Text;
using System.Text.Json.Serialization;
using backend.Features;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;

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
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance =
            $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";
    };
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddValidatorsFromAssembly(assembly);
builder.Services.AddEndpointsApiExplorer();
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
            policy.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod();
        }
    );
});
builder
    .Services.AddAuthentication("Bearer")
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
    });
builder.Services.AddAuthorization();

// Configure Serilog logger
// .WriteTo.Console(restrictedToMinimumLevel: LogEventLevel.Information)
// .WriteTo.File("Logs/log.txt")
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();
builder.Services.AddSerilog(Log.Logger);

var app = builder.Build();

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

app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapUserApi().MapPotApi().MapAuthApi();

app.Run();
