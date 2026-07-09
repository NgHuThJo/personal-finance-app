using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using backend.Src.Config;
using backend.Src.Features;
using backend.Src.Models;
using backend.Src.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;

// Args come from public static void main(string[] args), they are command line arguments
var builder = WebApplication.CreateBuilder(args);

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

// Register option classes which map to config sections
builder.Services.Configure<JwtConfig>(
    builder.Configuration.GetSection("Jwt:Schemas:Bearer")
);
builder.Services.Configure<PostgresConfig>(
    builder.Configuration.GetSection("PostgresConnection")
);
builder.Services.Configure<GoogleOAuthConfig>(
    builder.Configuration.GetSection("Authentication:Google")
);
builder.Services.Configure<GitHubOAuthConfig>(
    builder.Configuration.GetSection("Authentication:GitHub")
);

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
    // options.SerializerOptions.Converters.Add(
    //     new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
    // );
});
builder.Services.AddDbContext<AppDbContext>(
    (options) =>
    {
        var config = builder
            .Configuration.GetSection("ConnectionStrings")
            .Get<PostgresConfig>();

        options.UseNpgsql(config?.PostgresConnection);
    }
);
builder.Services.AddCors(options =>
{
    var config = builder
        .Configuration.GetRequiredSection("App")
        .Get<AppConfig>();

    if (config?.FrontendUrl is null)
    {
        throw new InvalidDataException(
            "App url config is missing frontend url"
        );
    }

    options.AddPolicy(
        "DevCorsPolicy",
        policy =>
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins(config.FrontendUrl);
        }
    );
});
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddBearerToken()
    .AddJwtBearer(options =>
    {
        var jwtConfig = builder
            .Configuration.GetRequiredSection("Jwt:Schemas:Bearer")
            .Get<JwtConfig>();

        if (
            jwtConfig?.Audience is null
            || jwtConfig?.Issuer is null
            || jwtConfig?.SecretKey is null
        )
        {
            throw new InvalidDataException(
                "Jwt keys cannot be found in config file"
            );
        }

        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig.Issuer,
            ValidAudience = jwtConfig.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtConfig.SecretKey)
            ),
            ClockSkew = TimeSpan.Zero,
        };
        // Use this to prevent sub claim from being mapped to legacy namespaces
        options.MapInboundClaims = false;
    })
    .AddGitHub(options =>
    {
        var githubSecretConfig = builder
            .Configuration.GetRequiredSection("Authentication:GitHub")
            .Get<GitHubOAuthConfig>();

        var clientId = githubSecretConfig?.ClientId;
        var clientSecret = githubSecretConfig?.ClientSecret;

        if (clientId is null || clientSecret is null)
        {
            throw new InvalidOperationException(
                $"GitHub clientId or clientSecret cannot be found in config file"
            );
        }

        options.ClientId = clientId;
        options.ClientSecret = clientSecret;
        options.CallbackPath = "/signin-github";
        options.Scope.Add("user:email");
        options.SaveTokens = true;

        options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "id");
        options.ClaimActions.MapJsonKey(ClaimTypes.Name, "login");

        // Add additional claims before the auth ticket is finalized
        options.Events.OnCreatingTicket = async (context) =>
        {
            var request = new HttpRequestMessage(
                HttpMethod.Get,
                "https://api.github.com/user/emails"
            );

            request.Headers.Authorization = new AuthenticationHeaderValue(
                "Bearer",
                context.AccessToken
            );

            var response = await context.Backchannel.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = JsonDocument.Parse(
                await response.Content.ReadAsStringAsync()
            );

            var primaryEmail = json
                .RootElement.EnumerateArray()
                .FirstOrDefault(j => j.GetProperty("primary").GetBoolean())
                .GetProperty("email")
                .GetString();

            if (!string.IsNullOrWhiteSpace(primaryEmail))
            {
                context?.Identity?.AddClaim(
                    new Claim(ClaimTypes.Email, primaryEmail)
                );
            }
        };

        // Ticket is ready for use here
        options.Events.OnTicketReceived = async (context) =>
        {
            var services = context.HttpContext.RequestServices;
            var jwtProvider = services.GetRequiredService<JwtTokenProvider>();
            var dbContext = services.GetRequiredService<AppDbContext>();

            var githubId = context
                .Principal?.FindFirst(ClaimTypes.NameIdentifier)
                ?.Value;
            var username = context.Principal?.FindFirst(ClaimTypes.Name)?.Value;
            var email = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;

            if (
                string.IsNullOrWhiteSpace(githubId)
                || string.IsNullOrWhiteSpace(username)
                || string.IsNullOrWhiteSpace(email)
            )
            {
                throw new InvalidOperationException(
                    "Required claims are missing from identity token"
                );
            }

            var providerInfo = await dbContext
                .UserAuthProviders.Include(u => u.User)
                .Where(u =>
                    u.Provider == AuthProvider.GitHub
                    && u.ProviderUserId == githubId
                )
                .SingleOrDefaultAsync();

            User user;
            if (providerInfo is null)
            {
                var userWithEmail = await dbContext
                    .Users.Include(u => u.AuthProvider)
                    .Where(u => u.Email == email)
                    .SingleOrDefaultAsync();
                var githubAuthProvider = new UserAuthProvider
                {
                    Provider = AuthProvider.GitHub,
                    ProviderUserId = githubId,
                };

                if (userWithEmail is null)
                {
                    user = new User
                    {
                        Email = email,
                        Name = username,
                        AvatarSeed = AvatarGenerator.GenerateSeed(),
                        AvatarStyle = AvatarGenerator.GetRandomStyle(),
                        Balance = new Balance(),
                    };
                    user.AuthProvider.Add(githubAuthProvider);
                    dbContext.Add(user);
                }
                else
                {
                    user = userWithEmail;
                    user.AuthProvider.Add(githubAuthProvider);
                }

                await dbContext.SaveChangesAsync();
            }
            else
            {
                user = providerInfo.User;
            }

            var accessToken = jwtProvider.GenerateAccessToken(user.Id);
            var refreshToken = new RefreshToken
            {
                Token = jwtProvider.GenerateRefreshToken(),
                ExpiresAtUtc = DateTimeOffset.UtcNow.AddDays(7),
                User = user,
            };

            dbContext.RefreshTokens.Add(refreshToken);
            await dbContext.SaveChangesAsync();

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

            var appConfig = builder
                .Configuration.GetRequiredSection("App")
                .Get<AppConfig>();

            if (appConfig?.FrontendRedirectUrl is null)
            {
                throw new InvalidDataException(
                    "App config does not contain frontend url"
                );
            }

            context?.Response.Redirect(
                $"{appConfig.FrontendRedirectUrl}/#{accessToken}"
            );

            context?.HandleResponse();
        };
    })
    .AddOpenIdConnect(options =>
    {
        var oidcConfig = builder
            .Configuration.GetRequiredSection("Authentication:Google")
            .Get<GoogleOAuthConfig>();

        if (
            oidcConfig?.Authority is null
            || oidcConfig?.ClientId is null
            || oidcConfig?.ClientSecret is null
        )
        {
            throw new InvalidOperationException(
                $"Google clientId or clientSecret cannot be found in config file"
            );
        }

        options.Authority = oidcConfig.Authority;
        options.ClientId = oidcConfig.ClientId;
        options.ClientSecret = oidcConfig.ClientSecret;

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
            var jwtTokenProvider =
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

            var providerRecord = await db
                .UserAuthProviders.Include(p => p.User)
                .SingleOrDefaultAsync(p =>
                    p.Provider == AuthProvider.Google && p.ProviderUserId == sub
                );

            User user; // Create new user if not associated with a provider
            if (providerRecord is null)
            {
                var userWithEmail = await db
                    .Users.Include(u => u.AuthProvider)
                    .Where(u => u.Email == email)
                    .SingleOrDefaultAsync();
                var googleAuthProvider = new UserAuthProvider
                {
                    Provider = AuthProvider.Google,
                    ProviderUserId = sub,
                };

                if (userWithEmail is null)
                {
                    user = new User
                    {
                        Email = email,
                        Name = name,
                        AvatarSeed = AvatarGenerator.GenerateSeed(),
                        AvatarStyle = AvatarGenerator.GetRandomStyle(),
                        Balance = new Balance(),
                    };
                    user.AuthProvider.Add(googleAuthProvider);
                    db.Users.Add(user);
                }
                else
                {
                    user = userWithEmail;
                    user.AuthProvider.Add(googleAuthProvider);
                }

                await db.SaveChangesAsync();
            }
            else
            {
                user = providerRecord.User;
            }

            var accessToken = jwtTokenProvider.GenerateAccessToken(user.Id);
            var refreshToken = new RefreshToken
            {
                Token = jwtTokenProvider.GenerateRefreshToken(),
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

            var appConfig = builder
                .Configuration.GetRequiredSection("App")
                .Get<AppConfig>();

            if (appConfig?.FrontendRedirectUrl is null)
            {
                throw new InvalidDataException(
                    "App config does not contain frontend url"
                );
            }

            context.Response.Redirect(
                $"{appConfig.FrontendRedirectUrl}/#{jwt}"
            );

            // Used to prevent default auth flow
            // Necessary if you implement your own auth flow, JWT in this case
            // Without it the current redirect would be overridden by the challenge redirect
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
            options.PermitLimit = 100;
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
                        TokenLimit = 500,
                        TokensPerPeriod = 100,
                        ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                    }
                );
            }

            return RateLimitPartition.GetFixedWindowLimiter(
                "anonymous",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 100,
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

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor
        | ForwardedHeaders.XForwardedHost
        | ForwardedHeaders.XForwardedProto;
    // Only loopback proxies are allowed by default
    // Clear that restriction because forwarders are enabled by explicit configuration
    options.KnownProxies.Clear();
    options.KnownIPNetworks.Clear();
});

var app = builder.Build();

// Run migrations before app.Run()
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Handle startup race with Docker database
    var retries = 10;

    while (retries > 0)
    {
        try
        {
            db.Database.Migrate();
            break;
        }
        catch
        {
            retries--;
            Thread.Sleep(TimeSpan.FromSeconds(2));
        }
    }

    if (retries == 0)
    {
        throw new Exception("Could not apply migrations");
    }
}

// Use Serilog middleware, add this before any other middleware for ordering reasons
app.UseSerilogRequestLogging();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("DevCorsPolicy");
    app.MapScalarApiReference();
    app.UseHttpsRedirection();
}

// Before forwarding headers
app.Use(
    async (context, next) =>
    {
        var logger = context.RequestServices.GetRequiredService<
            ILogger<Program>
        >();

        logger.LogInformation(
            """BEFORE forwarding headers: URL: {Url}, Host: {Host}, X-Forwarded-Host: {XFH}, X-Forwarded-Proto: {XFP}, X-Forwarded-For: {XFF}""",
            $"{context.Request.Scheme}://{context.Request.Host}{context.Request.Path}{context.Request.QueryString}",
            context.Request.Host,
            context.Request.Headers["X-Forwarded-Host"].ToString(),
            context.Request.Headers["X-Forwarded-Proto"].ToString(),
            context.Request.Headers["X-Fowarded-For"].ToString()
        );

        await next();
    }
);

// Must be used before authentication and authorization
app.UseForwardedHeaders();

// After forwarding headers
app.Use(
    async (context, next) =>
    {
        var logger = context.RequestServices.GetRequiredService<
            ILogger<Program>
        >();

        logger.LogInformation(
            """AFTER forwarding headers: URL: {Url}, Host: {Host}, X-Forwarded-Host: {XFH}, X-Forwarded-Proto: {XFP}, X-Forwarded-For: {XFF}""",
            $"{context.Request.Scheme}://{context.Request.Host}{context.Request.Path}{context.Request.QueryString}",
            context.Request.Host,
            context.Request.Headers["X-Forwarded-Host"].ToString(),
            context.Request.Headers["X-Forwarded-Proto"].ToString(),
            context.Request.Headers["X-Forwarded-For"].ToString()
        );

        await next();
    }
);

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
    .MapTransactionApi()
    .MapCategoryApi();

app.Run();
