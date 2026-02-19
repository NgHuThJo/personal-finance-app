using System.Net;
using System.Net.Http.Json;
using backend.Features;
using FluentAssertions;
using Xunit;

namespace backend.IntegrationTests;

public class UserApiTest : IntegrationTestBase
{
    public UserApiTest(DatabaseFixture fixture)
        : base(fixture)
    {
        Factory.DefaultUserId = "1";
    }

    private const string _uriPath = "/api/users";

    [Fact]
    public async Task GetUserById_WhenSuccessful_ReturnStatusCode200()
    {
        var getResponse = await Client.GetAsync(
            _uriPath,
            TestContext.Current.CancellationToken
        );

        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var content =
            await getResponse.Content.ReadFromJsonAsync<GetUserByIdResponse>(
                TestContext.Current.CancellationToken
            );

        content.Should().NotBeNull();
    }

    [Fact]
    public async Task GetUserById_WhenIdIsInvalid_ReturnStatusCode400()
    {
        Client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, "0");

        var getResponse = await Client.GetAsync(
            _uriPath,
            TestContext.Current.CancellationToken
        );

        getResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetUserById_WhenIdDoesNotExist_ReturnStatusCode422()
    {
        Client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, "1000");

        // Test case where the id is not in the database
        var getResponse = await Client.GetAsync(
            _uriPath,
            TestContext.Current.CancellationToken
        );

        getResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
