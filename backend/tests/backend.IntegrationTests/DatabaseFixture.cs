using backend.Models;
using backend.Shared;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Testcontainers.PostgreSql;
using Xunit;

namespace backend.IntegrationTests;

public class DatabaseFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container;
    public string ConnectionString { get; private set; }
    public string DatabaseName { get; } = $"test_{Guid.NewGuid():N}";

    public DatabaseFixture(PostgresContainerFixture containerFixture)
    {
        _container = containerFixture.Container;
        ConnectionString = _container.GetConnectionString();
    }

    public async ValueTask InitializeAsync()
    {
        await using var adminConnection = new NpgsqlConnection(
            _container.GetConnectionString()
        );

        await adminConnection.OpenAsync();

        await using var createCommand = adminConnection.CreateCommand();
        createCommand.CommandText = $"""CREATE DATABASE "{DatabaseName}";""";
        await createCommand.ExecuteNonQueryAsync();

        ConnectionString = new NpgsqlConnectionStringBuilder(
            _container.GetConnectionString()
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
            _container.GetConnectionString()
        );

        await adminConnection.OpenAsync();
        await using var dropCommand = adminConnection.CreateCommand();

        dropCommand.CommandText = $"""
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '{DatabaseName}';
            DROP DATABASE "{DatabaseName};
            """;

        await dropCommand.ExecuteNonQueryAsync();
    }
}
