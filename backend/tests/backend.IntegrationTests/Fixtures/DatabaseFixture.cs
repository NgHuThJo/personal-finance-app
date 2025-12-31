using backend.Models;
using backend.Shared;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Testcontainers.PostgreSql;
using Xunit;

namespace backend.IntegrationTests;

public class DatabaseFixture(PostgresContainerFixture containerFixture)
    : IAsyncLifetime
{
    public PostgreSqlContainer Container { get; init; } =
        containerFixture.Container;
    public string ConnectionString { get; private set; } = null!;
    public string DatabaseName { get; } = $"test_{Guid.NewGuid():N}";

    public async ValueTask InitializeAsync()
    {
        ConnectionString = Container.GetConnectionString();

        await using var adminConnection = new NpgsqlConnection(
            Container.GetConnectionString()
        );

        await adminConnection.OpenAsync();

        await using var createCommand = adminConnection.CreateCommand();
        createCommand.CommandText = $"""CREATE DATABASE "{DatabaseName}";""";
        await createCommand.ExecuteNonQueryAsync();

        ConnectionString = new NpgsqlConnectionStringBuilder(
            Container.GetConnectionString()
        )
        {
            Database = DatabaseName,
        }.ToString();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        await using var db = new AppDbContext(
            options,
            new TimestampInterceptor()
        );

        await db.Database.MigrateAsync();

        // Seed database here
        var fakeUsers = UserFaker
            .CreateUserFaker()
            .UseSeed(TestConstants.TESTDATA_SEED);

        var newUsers = fakeUsers.Generate(5);
        db.Set<User>().AddRange(newUsers);
        await db.SaveChangesAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await using var adminConnection = new NpgsqlConnection(
            Container.GetConnectionString()
        );
        await adminConnection.OpenAsync();

        await using (var terminatedCommand = adminConnection.CreateCommand())
        {
            terminatedCommand.CommandText = $"""
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = '{DatabaseName}';
                """;

            await terminatedCommand.ExecuteNonQueryAsync();
        }

        await using (var dropCommand = adminConnection.CreateCommand())
        {
            dropCommand.CommandText = $"""
                DROP DATABASE "{DatabaseName}";
                """;

            await dropCommand.ExecuteNonQueryAsync();
        }
    }
}
