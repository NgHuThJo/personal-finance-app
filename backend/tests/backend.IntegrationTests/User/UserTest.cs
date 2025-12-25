using System.Net.Http.Json;
using backend.Features;
using backend.IntegrationTests;
using FluentAssertions;
using Xunit;

public class UserApiTest(SetupTestFixture fixture)
    : IClassFixture<SetupTestFixture>
{
    private readonly SetupTestFixture _fixture = fixture;
    private const string _baseApiUrl = "/api/users";

    [Fact]
    public async Task GetUserById_WhenSuccessful_ReturnStatusCode200()
    {
        var getResponse =
            await _fixture.Client.GetFromJsonAsync<GetUserByIdResponse>(
                $"{_baseApiUrl}/1",
                TestContext.Current.CancellationToken
            );

        getResponse.Should().NotBeNull();
    }
}
