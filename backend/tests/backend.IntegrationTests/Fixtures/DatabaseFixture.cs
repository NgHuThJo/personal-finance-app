using backend.Models;
using backend.Shared;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Respawn;
using Testcontainers.PostgreSql;
using Xunit;

namespace backend.IntegrationTests;

public class DatabaseFixture(PostgresContainerFixture containerFixture)
    : IAsyncLifetime
{
    private Respawner _respawner = null!;
    private NpgsqlConnection _connection = null!;
    public PostgreSqlContainer Container { get; init; } =
        containerFixture.Container;
    public string ConnectionString { get; private set; } = null!;
    public string DatabaseName { get; } = $"test_{Guid.NewGuid():N}";

    public async ValueTask InitializeAsync()
    {
        await using (
            var adminConnection = new NpgsqlConnection(
                Container.GetConnectionString()
            )
        )
        {
            await adminConnection.OpenAsync();

            await using var createCommand = adminConnection.CreateCommand();
            createCommand.CommandText =
                $"""CREATE DATABASE "{DatabaseName}";""";
            await createCommand.ExecuteNonQueryAsync();
        }

        ConnectionString = new NpgsqlConnectionStringBuilder(
            Container.GetConnectionString()
        )
        {
            Database = DatabaseName,
        }.ToString();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        await using (
            var db = new AppDbContext(options, new TimestampInterceptor())
        )
        {
            // First migrate, then seed
            await db.Database.MigrateAsync();
            await SeedTestDb();
        }

        _connection = new NpgsqlConnection(ConnectionString);
        await _connection.OpenAsync();

        _respawner = await Respawner.CreateAsync(
            _connection,
            new RespawnerOptions
            {
                DbAdapter = DbAdapter.Postgres,
                SchemasToInclude = ["public"],
                TablesToIgnore = ["__EFMigrationsHistory"],
                // WithReseed resets serial/identity counters
                WithReseed = true,
            }
        );
    }

    public async Task SeedTestDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        await using var db = new AppDbContext(
            options,
            new TimestampInterceptor()
        );

        // Seed database here
        var listOfFakeUsers = UserFaker
            .CreateUserFaker()
            .Generate(TestConstants.NUMBER_OF_USERS);

        db.Set<User>().AddRange(listOfFakeUsers);
        await db.SaveChangesAsync();
    }

    public async Task ResetAsync()
    {
        await _respawner.ResetAsync(_connection);
    }

    public async ValueTask DisposeAsync()
    {
        var adminConnection = new NpgsqlConnection(
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
