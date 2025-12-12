using System.Net;
using System.Net.Http.Json;
using backend.Features;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace backend.IntegrationTests;

public class UserApiTest(SetupTestFixture fixture)
    : IClassFixture<SetupTestFixture>
{
    private readonly SetupTestFixture _fixture = fixture;

    // Pay attention to the missing trailing slash
    private readonly string _baseApiUrl = "/api/users";

    [Fact]
    public async Task CreateUser_WhenSuccessful_ReturnsUser()
    {
        // Arrange
        var fakeData = UserFaker.CreateUser();
        // Act
        var postResponse = await _fixture.Client.PostAsJsonAsync(
            _baseApiUrl,
            fakeData
        );
        var createdUser =
            await postResponse.Content.ReadFromJsonAsync<GetUserByIdResponse>();
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        createdUser.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateUser_WhenValidationFails_ReturnStatusCode400()
    {
        // Arrange
        var fakeData = new CreateUserRequest { Email = "", Password = "" };
        // Act
        var postResponse = await _fixture.Client.PostAsJsonAsync(
            _baseApiUrl,
            fakeData
        );
        var validationResult =
            await postResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        validationResult?.Errors.Should().ContainKey("Email");
    }

    [Fact]
    public async Task CreateUser_WhenEmailAlreadyExists_ReturnStatusCode409()
    {
        var fakeData = UserFaker.CreateUser();

        var postResponse = await _fixture.Client.PostAsJsonAsync(
            _baseApiUrl,
            fakeData
        );
        var newUser =
            await postResponse.Content.ReadFromJsonAsync<GetUserByIdResponse>();

        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        newUser.Should().NotBeNull();

        postResponse = await _fixture.Client.PostAsJsonAsync(
            _baseApiUrl,
            fakeData
        );
        postResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }
}
