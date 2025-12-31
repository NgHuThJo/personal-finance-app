using System.Net;
using System.Net.Http.Json;
using backend.Features;
using FluentAssertions;
using Xunit;

namespace backend.IntegrationTests;

public class UserApiTest(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string _baseApiUrl = "/api/users";

    [Fact]
    public async Task GetUserById_WhenSuccessful_ReturnStatusCode200()
    {
        var getResponse = await Client.GetAsync(
            $"{_baseApiUrl}/1",
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
        var getResponse = await Client.GetAsync(
            $"{_baseApiUrl}/0",
            TestContext.Current.CancellationToken
        );

        getResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetUserById_WhenIdDoesNotExist_ReturnStatusCode422()
    {
        // Test case where the id is not in the database
        var getResponse = await Client.GetAsync(
            $"{_baseApiUrl}/1000",
            TestContext.Current.CancellationToken
        );

        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
