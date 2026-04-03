using Testcontainers.PostgreSql;
using Xunit;

[assembly: AssemblyFixture(
    typeof(backend.Tests.IntegrationTests.PostgresContainerFixture)
)]

namespace backend.Tests.IntegrationTests;

public class PostgresContainerFixture : IAsyncLifetime
{
    public PostgreSqlContainer Container { get; private set; } = null!;

    public async ValueTask InitializeAsync()
    {
        Container = new PostgreSqlBuilder()
            .WithImage("postgres:18")
            .WithReuse(true)
            .WithLabel("reuse-id", "personal-finance-app")
            .Build();

        await Container.StartAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await Container.DisposeAsync();
    }
}
