using System.Net;
using System.Net.Http.Json;
using backend.Src.Features;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace backend.Tests.IntegrationTests;

public class UserApiTest : IntegrationTestBase
{
    public UserApiTest(DatabaseFixture fixture)
        : base(fixture)
    {
        Factory.DefaultUserId = "1";
    }

    private const string _uriPath = "/v1/users";

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
        var request = new HttpRequestMessage(HttpMethod.Get, _uriPath);
        request.Headers.Add(TestAuthHandler.UserIdHeader, "0");

        var getResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );

        getResponse.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
    }
}
