using System.Net;
using System.Net.Http.Json;
using backend.Features;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace backend.IntegrationTests;

public class AuthApiTest(DatabaseFixture dbFixture)
    : IntegrationTestBase(dbFixture)
{
    // Pay attention to the missing trailing slash
    private const string _baseApiUrl = "/api/auth/signup";

    [Fact]
    public async Task SignUpUser_WhenSuccessful_ReturnsUser()
    {
        // Arrange
        var fakeData = AuthFaker.CreateSignUpUser();
        // Act
        var postResponse = await Client.PostAsJsonAsync(
            _baseApiUrl,
            fakeData,
            TestContext.Current.CancellationToken
        );
        var createdUser =
            await postResponse.Content.ReadFromJsonAsync<SignUpUserResponse>(
                TestContext.Current.CancellationToken
            );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        createdUser.Should().NotBeNull();
    }

    [Fact]
    public async Task SignUpUser_WhenValidationFails_ReturnStatusCode400()
    {
        // Arrange
        var fakeData = new SignUpUserRequest
        {
            Email = "",
            Password = "",
            Name = "",
        };
        // Act
        var postResponse = await Client.PostAsJsonAsync(
            _baseApiUrl,
            fakeData,
            TestContext.Current.CancellationToken
        );
        var validationResult =
            await postResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>(
                TestContext.Current.CancellationToken
            );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        validationResult?.Errors.Should().ContainKey("Email");
    }

    [Fact]
    public async Task SignUpUser_WhenEmailAlreadyExists_ReturnStatusCode409()
    {
        var fakeData = AuthFaker.CreateSignUpUser();

        var postResponse = await Client.PostAsJsonAsync(
            _baseApiUrl,
            fakeData,
            TestContext.Current.CancellationToken
        );
        var newUser =
            await postResponse.Content.ReadFromJsonAsync<SignUpUserResponse>(
                TestContext.Current.CancellationToken
            );

        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        newUser.Should().NotBeNull();

        postResponse = await Client.PostAsJsonAsync(
            _baseApiUrl,
            fakeData,
            TestContext.Current.CancellationToken
        );
        postResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }
}
