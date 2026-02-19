using System.Net.Http.Headers;
using Xunit;

namespace backend.IntegrationTests;

public abstract class IntegrationTestBase
    : IClassFixture<DatabaseFixture>,
        IAsyncLifetime
{
    protected DatabaseFixture Db { get; init; }
    protected HttpClient Client { get; init; }
    protected TestWebApplicationFactory Factory { get; init; }

    protected IntegrationTestBase(DatabaseFixture dbFixture)
    {
        Db = dbFixture;
        Factory = new TestWebApplicationFactory(dbFixture.ConnectionString);
        Client = Factory.CreateClient();
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("TestScheme");
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync()
    {
        await Db.ResetAsync();
        await Db.SeedTestDb();
    }
}
