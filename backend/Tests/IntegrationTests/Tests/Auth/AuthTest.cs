using System.Net;
using System.Net.Http.Json;
using backend.Shared.Test;
using backend.Src.Features;
using backend.Src.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using Xunit;

namespace backend.IntegrationTests;

public class AuthApiTest(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    // Pay attention to the missing trailing slash
    private const string _uriPath = "/v1/auth";

    [Fact]
    public async Task SignUpUser_WhenSuccessful_ReturnsUser()
    {
        // Arrange
        var fakeData = AuthFaker.SignUpUserRequest();
        var path = $"{_uriPath}/signup";
        // Act
        var postResponse = await Client.PostAsJsonAsync(
            path,
            fakeData,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdUser =
            await postResponse.Content.ReadFromJsonAsync<SignUpUserResponse>(
                TestContext.Current.CancellationToken
            );
        createdUser.Should().NotBeNull();
    }

    [Fact]
    public async Task SignUpUser_WhenValidationFails_ReturnStatusCode400()
    {
        // Arrange
        var fakeData = AuthFaker.SignUpUserRequest() with
        {
            Email = "",
            Name = "",
            Password = "",
        };
        var path = $"{_uriPath}/signup";
        // Act
        var postResponse = await Client.PostAsJsonAsync(
            path,
            fakeData,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var validationResult =
            await postResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>(
                TestContext.Current.CancellationToken
            );
        validationResult?.Errors.Should().ContainKey("Email");
    }

    [Fact]
    public async Task SignUpUser_WhenEmailAlreadyExists_ReturnStatusCode409()
    {
        // Arrange
        var path = $"{_uriPath}/signup";
        var fakeData = AuthFaker.SignUpUserRequest();
        // Act
        var postResponse = await Client.PostAsJsonAsync(
            path,
            fakeData,
            TestContext.Current.CancellationToken
        );
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var newUser =
            await postResponse.Content.ReadFromJsonAsync<SignUpUserResponse>(
                TestContext.Current.CancellationToken
            );
        newUser.Should().NotBeNull();

        postResponse = await Client.PostAsJsonAsync(
            path,
            fakeData,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task LoginUser_IfSuccessful_Return200()
    {
        // Arrange
        var path = $"{_uriPath}/login";
        var email = "some@randomemail.com";
        var password = "password";
        var state = TestState
            .New(Db.CreateDbContext())
            .WithUser(
                u =>
                {
                    u.Email = email;
                    u.PasswordHash = password;
                },
                out User user
            );
        await state.SaveAsync();
        var fakeData = AuthFaker.LoginUserRequest() with
        {
            Email = email,
            Password = password,
        };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            path,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        postResponse.Headers.TryGetValues("Set-Cookie", out var cookies);
        var refreshToken = cookies
            ?.Select(c => c.Split(";")[0])
            .FirstOrDefault(c => c.StartsWith("refresh_token="))
            ?.Split("=")[1];
        refreshToken.Should().NotBeNull();
    }

    [Fact]
    public async Task LoginUser_IfUserEntersInvalidData_Return400()
    {
        // Arrange
        var path = $"{_uriPath}/login";
        var fakeData = AuthFaker.LoginUserRequest() with
        {
            Email = "",
            Password = "",
        };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            path,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task LoginUser_IfUserHasNoPassword_Return401()
    {
        // Arrange
        var path = $"{_uriPath}/login";
        var state = TestState
            .New(Db.CreateDbContext())
            .WithUser(
                u =>
                {
                    u.PasswordHash = null;
                },
                out User user
            );
        await state.SaveAsync();

        var fakeData = AuthFaker.LoginUserRequest() with { Email = user.Email };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            path,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task LoginUser_IfEmailDoesNotExist_Return401()
    {
        // Arrange
        var path = $"{_uriPath}/login";
        var fakeData = AuthFaker.LoginUserRequest() with
        {
            Email = "some@randomemail.com",
        };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            path,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task LogoutUser_IfSuccessful_Return204()
    {
        // Arrange
        var path = $"{_uriPath}/logout";
        var state = TestState
            .New(Db.CreateDbContext())
            .WithRefreshToken(r => { }, out RefreshToken refreshToken);
        await state.SaveAsync();

        var request = new HttpRequestMessage(HttpMethod.Post, path);
        request.Headers.Add("Cookie", "refresh_token=somerandomstring");
        // Act
        var postResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
        postResponse.Headers.TryGetValues("Set-Cookie", out var cookies);
        var newRefreshToken = cookies
            ?.Select(c => c.Split(";")[0])
            .FirstOrDefault(c => c.Contains("refresh_token="))
            ?.Split("=")[1];
        newRefreshToken.Should().BeEmpty();
    }

    [Fact]
    public async Task LogoutUser_IfNoRefreshTokenFound_Return403()
    {
        // Arrange
        var path = $"{_uriPath}/logout";
        // Act
        var postResponse = await Client.PostAsync(
            path,
            null,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateRefreshToken_IfSuccessful_Return200()
    {
        // Arrange
        var path = $"{_uriPath}/refresh";
        var state = TestState
            .New(Db.CreateDbContext())
            .WithRefreshToken(
                r =>
                {
                    r.Token = "somerandombase64string";
                },
                out RefreshToken refreshToken
            );
        await state.SaveAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add("Cookie", $"refresh_token={refreshToken.Token}");
        request.Headers.Add(
            TestAuthHandler.UserIdHeader,
            state.DefaultUser.Id.ToString()
        );
        // Act
        var postResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var responsePayload =
            await postResponse.Content.ReadFromJsonAsync<CreateRefreshTokenResponse>(
                TestContext.Current.CancellationToken
            );
        responsePayload?.AccessToken.Should().NotBeNullOrEmpty();
        postResponse.Headers.TryGetValues("Set-Cookie", out var cookies);
        var newRefreshToken = cookies
            ?.Select(c => c.Split(";")[0])
            .FirstOrDefault(c =>
                c.StartsWith("refresh_token") && !c.EndsWith('=')
            )
            ?.Split("=")[1];
        newRefreshToken.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task CreateRefreshToken_IfNoRefreshTokenInCookie_Return401()
    {
        // Arrange
        var path = $"{_uriPath}/refresh";
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        // Act
        var postResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateRefreshToken_IfRefreshTokenIsNotInDb_Return401()
    {
        // Arrange
        var path = $"{_uriPath}/refresh";
        var state = TestState
            .New(Db.CreateDbContext())
            .WithRefreshToken(
                r =>
                {
                    r.Token = "somerandombase64string";
                },
                out RefreshToken refreshToken
            );
        await state.SaveAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add("Cookie", $"refresh_token=invalidtoken");
        request.Headers.Add(
            TestAuthHandler.UserIdHeader,
            state.DefaultUser.Id.ToString()
        );
        // Act
        var postResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateRefreshToken_IfRefreshTokenHasExpired_Return401()
    {
        // Arrange
        var path = $"{_uriPath}/refresh";
        var state = TestState
            .New(Db.CreateDbContext())
            .WithRefreshToken(
                r =>
                {
                    r.Token = "somerandombase64string";
                    r.ExpiresAtUtc = DateTime.UtcNow.AddDays(-7);
                },
                out RefreshToken refreshToken
            );
        await state.SaveAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add("Cookie", $"refresh_token=${refreshToken.Token}");
        request.Headers.Add(
            TestAuthHandler.UserIdHeader,
            state.DefaultUser.Id.ToString()
        );
        // Act
        var postResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateRefreshToken_IfRefreshTokenIsRevoked_Return401()
    {
        // Arrange
        var path = $"{_uriPath}/refresh";
        var state = TestState
            .New(Db.CreateDbContext())
            .WithRefreshToken(
                r =>
                {
                    r.Token = "somerandombase64string";
                    r.IsRevoked = true;
                },
                out RefreshToken refreshToken
            );
        await state.SaveAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add("Cookie", $"refresh_token=${refreshToken.Token}");
        request.Headers.Add(
            TestAuthHandler.UserIdHeader,
            state.DefaultUser.Id.ToString()
        );
        // Act
        var postResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
