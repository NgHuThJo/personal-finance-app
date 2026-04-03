using System.Net;
using System.Net.Http.Json;
using backend.Shared.Test;
using backend.Src.Features;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace backend.Tests.IntegrationTests;

public class BudgetTest(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string _uriPath = "/v1/budgets";

    [Fact]
    public async Task GetAllBudgets_IfSuccessful_Return200()
    {
        // Arrange
        // Act
        var getResponse = await Client.GetAsync(
            _uriPath,
            TestContext.Current.CancellationToken
        );
        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await getResponse.Content.ReadFromJsonAsync<
            List<GetAllBudgetsResponse>
        >(TestContext.Current.CancellationToken);
        content.Should().AllBeOfType<GetAllBudgetsResponse>();
    }

    [Fact]
    public async Task GetAllBudgets_IfUserIdIsInvalid_Return500()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Get, _uriPath);
        request.Headers.Add(TestAuthHandler.UserIdHeader, "0");
        // Act
        var getResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task CreateBudget_IfSuccessful_Return201()
    {
        // Arrange
        var fakeData = BudgetFaker.CreateBudgetRequest();
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var getResponse = await Client.PostAsync(
            _uriPath,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task CreateBudget_IfValidationError_Return400()
    {
        // Arrange
        var fakeData = BudgetFaker.CreateBudgetRequest() with
        {
            Maximum = -1,
        };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var getResponse = await Client.PostAsync(
            _uriPath,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var validationResult =
            await getResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>(
                TestContext.Current.CancellationToken
            );

        validationResult?.Errors.Should().ContainKey("Maximum");
    }
}
