using backend.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Xunit;

namespace backend.IntegrationTests;

// Extend this with every test class
public class SetupTestFixture : IAsyncLifetime
{
    public WebApplicationFactory<Program> Factory { get; private set; } = null!;
    public PostgreSqlContainer DbContainer { get; private set; } = null!;
    public HttpClient Client { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        DbContainer = new PostgreSqlBuilder()
            .WithImage("postgres:latest")
            .WithDatabase("testdb")
            .Build();
        await DbContainer.StartAsync();

        var connectionString = DbContainer.GetConnectionString();

        Factory = new WebApplicationFactory<Program>().WithWebHostBuilder(
            builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var dbContextService = services.SingleOrDefault(d =>
                        d.ServiceType == typeof(DbContextOptions<AppDbContext>)
                    );

                    if (dbContextService is not null)
                    {
                        services.Remove(dbContextService);
                    }

                    services.AddDbContext<AppDbContext>(options =>
                        options.UseNpgsql(connectionString)
                    );
                });

                Environment.SetEnvironmentVariable(
                    "ConnectionStrings:PostgresConnection",
                    connectionString
                );
            }
        );

        Client = Factory.CreateClient();

        // Ensure that db is created
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await DbContainer.StopAsync();
        Factory.Dispose();
    }
}
