using System.Net.Http.Json;
using backend.Features;
using FluentAssertions;
using Xunit;

namespace backend.IntegrationTests;

public class UserApiTest(SetupTestFixture fixture)
    : IClassFixture<SetupTestFixture>
{
    private readonly SetupTestFixture _fixture = fixture;
    private readonly HttpClient _client = fixture.Factory.CreateClient();

    [Fact]
    public async Task CreateUser_WhenSuccessful_ReturnsUser()
    {
        // Arrange
        var fakeData = UserFaker.CreateUser();
        // Act
        var postResponse = await _client.PostAsJsonAsync(
            "/api/users",
            fakeData
        );
        postResponse.EnsureSuccessStatusCode();
        // Assert
        var createdUser =
            await postResponse.Content.ReadFromJsonAsync<CreateUserResponse>();
        createdUser.Should().NotBeNull();
        Console.WriteLine($"user: {createdUser}");
    }
}
