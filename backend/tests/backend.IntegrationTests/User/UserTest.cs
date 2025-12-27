using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using backend.Features;
using FluentAssertions;
using Xunit;

namespace backend.IntegrationTests;

public class UserApiTest(SetupTestFixture fixture)
    : IClassFixture<SetupTestFixture>
{
    private readonly SetupTestFixture _fixture = fixture;
    private const string _baseApiUrl = "/api/users";

    [Fact]
    public async Task GetUserById_WhenSuccessful_ReturnStatusCode200()
    {
        var getResponse =
            await _fixture.Client.GetAsync(
                $"{_baseApiUrl}/1",
            TestContext.Current.CancellationToken
            );

          getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await  getResponse.Content.ReadFromJsonAsync()

    }

    [Fact]
    public async Task GetUserById_WhenIdDoesNotExist_ReturnStatusCode400()
    {
        var getResponse = await _fixture.Client.GetFromJsonAsync<GetUserByIdResponse>(
            $"{_baseApiUrl}/0",
            TestContext.Current.CancellationToken
        );


        getResponse.Should().NotBeNull();
    }
}
