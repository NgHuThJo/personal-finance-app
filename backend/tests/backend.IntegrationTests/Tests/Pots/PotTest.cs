using System.Net;
using System.Net.Http.Json;
using System.Net.Mime;
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
        var fakeData = PotFaker.CreatePot();
        var jsonContent = JsonContent.Create(fakeData);

        var postResponse = await Client.PostAsync(
            _baseApiUrl,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        var content =
            await postResponse.Content.ReadFromJsonAsync<CreatePotResponse>(
                TestContext.Current.CancellationToken
            );

        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        content.Should().NotBeNull();
    }

    [Fact]
    public async Task CreatePot_IfValidationFails_ReturnStatusCode400()
    {
        var fakeData = new Pot() { Target = -1, Name = "" };

        var jsonContent = JsonContent.Create(fakeData);
        var postResponse = await Client.PostAsync(
            _baseApiUrl,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        var content =
            await postResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>(
                TestContext.Current.CancellationToken
            );

        postResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        content.Should().NotBeNull();
        content.Errors.Should().ContainKeys("Target", "UserId");
    }
}
