using System.Net.Http.Headers;
using Xunit;

namespace backend.IntegrationTests;

public abstract class IntegrationTestBase : IClassFixture<DatabaseFixture>
{
    protected HttpClient Client { get; init; }

    protected IntegrationTestBase(DatabaseFixture dbFixture)
    {
        var factory = new TestWebApplicationFactory(dbFixture.ConnectionString);

        Client = factory.CreateClient();
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("TestScheme");
    }
}
