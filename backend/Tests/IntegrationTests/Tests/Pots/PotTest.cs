using System.Net;
using System.Net.Http.Json;
using backend.Shared.Test;
using backend.Src.Features;
using backend.Src.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace backend.IntegrationTests;

public class PotApiTest(DatabaseFixture dbFixture)
    : IntegrationTestBase(dbFixture)
{
    private readonly string _uriPath = "/v1/pots";

    // CreatePot
    [Fact]
    public async Task CreatePot_IfSuccessful_ReturnStatusCode201()
    {
        // Arrange
        var fakeData = PotFaker.CreatePotRequest();
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            _uriPath,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task CreatePot_IfValidationFails_ReturnStatusCode400()
    {
        // Arrange
        var fakeData = new Pot() { Target = -1, Name = "" };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            _uriPath,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content =
            await postResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>(
                TestContext.Current.CancellationToken
            );
        content.Should().NotBeNull();
        content.Errors.Should().ContainKeys("Target", "Name");
    }

    // GetAllPots
    [Fact]
    public async Task GetAllPots_IfSuccessful_Return200()
    {
        // Arrange
        // Act
        var getResponse = await Client.GetFromJsonAsync<
            List<GetAllPotsResponse>
        >(_uriPath, TestContext.Current.CancellationToken);
        // Assert
        getResponse
            .Should()
            .HaveCountGreaterThan(0)
            .And.BeOfType<List<GetAllPotsResponse>>();
    }

    // WithdrawMoneyFromPot
    [Fact]
    public async Task WithdrawMoneyFromPot_IfSuccessful_Return204()
    {
        // Arrange
        var fakeData = PotFaker.WithdrawMoneyFromPotRequest();
        var jsonContent = JsonContent.Create(fakeData);
        var path = $"{_uriPath}/1/withdrawal";
        // Act
        var putResponse = await Client.PatchAsync(
            path,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        putResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task WithdrawMoneyFromPot_IfPotIdNotFound_Return422()
    {
        // Arrange
        var fakeData = PotFaker.WithdrawMoneyFromPotRequest();
        var jsonContent = JsonContent.Create(fakeData);
        var path = $"{_uriPath}/1000/withdrawal";
        // Act
        var putResponse = await Client.PatchAsync(
            path,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        putResponse
            .StatusCode.Should()
            .Be(HttpStatusCode.UnprocessableContent);
        var content =
            await putResponse.Content.ReadFromJsonAsync<ProblemDetails>(
                TestContext.Current.CancellationToken
            );
        content.Should().NotBeNull();
        content.Detail.Should().NotBeNullOrEmpty();
    }

    // AddMoneyToPot
    [Fact]
    public async Task AddMoneyToPot_IfSuccessful_Return204()
    {
        // Arrange
        var fakeData = PotFaker.AddMoneyToPotRequest();
        var jsonContent = JsonContent.Create(fakeData);
        var path = $"{_uriPath}/1/addition";
        // Act
        var putResponse = await Client.PatchAsync(
            path,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        putResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task AddMoneyToPot_IfPotIdDoesNotExist_Return422()
    {
        // Arrange
        var fakeData = PotFaker.AddMoneyToPotRequest();
        var jsonContent = JsonContent.Create(fakeData);
        var path = $"{_uriPath}/1000/addition";
        // Act
        var putResponse = await Client.PatchAsync(
            path,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        putResponse
            .StatusCode.Should()
            .Be(HttpStatusCode.UnprocessableContent);
        var responseBody =
            await putResponse.Content.ReadFromJsonAsync<ProblemDetails>(
                TestContext.Current.CancellationToken
            );
        responseBody?.Detail.Should().NotBeNullOrEmpty();
    }
}
