using System.Net;
using System.Net.Http.Json;
using backend.Features;
using backend.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace backend.IntegrationTests;

public class PotApiTest(DatabaseFixture dbFixture)
    : IntegrationTestBase(dbFixture)
{
    private readonly string _baseApiUrl = "/api/pots";

    [Fact]
    public async Task CreatePot_IfSuccessful_ReturnStatusCode201()
    {
        // Arrange
        var fakeData = PotFaker.CreatePotRequest();
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            _baseApiUrl,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var content =
            await postResponse.Content.ReadFromJsonAsync<CreatePotResponse>(
                TestContext.Current.CancellationToken
            );
        content.Should().NotBeNull();
    }

    [Fact]
    public async Task CreatePot_IfValidationFails_ReturnStatusCode400()
    {
        // Arrange
        var fakeData = new Pot() { Target = -1, Name = "" };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            _baseApiUrl,
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
}
