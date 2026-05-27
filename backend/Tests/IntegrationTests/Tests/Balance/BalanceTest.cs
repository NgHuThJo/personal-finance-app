using System.Net;
using FluentAssertions;
using Xunit;

namespace backend.Tests.IntegrationTests;

[Trait("Category", "Balance")]
public class BalanceTest(
    DatabaseFixture fixture,
    ITestOutputHelper outputHelper
) : IntegrationTestBase(fixture)
{
    private const string _uriPath = "v1/balances";
    private readonly ITestOutputHelper _outputHelper = outputHelper;

    [Fact]
    public async Task GetBalanceByUserId_IfSuccessful_Return200()
    {
        // Arrange
        var path = $"{_uriPath}/me";
        // Act
        var getResponse = await Client.GetAsync(
            path,
            TestContext.Current.CancellationToken
        );
        var content = await getResponse.Content.ReadAsStringAsync();
        _outputHelper.WriteLine($"in balance: {content}");
        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetBalanceByUserId_IfInvalidUserId_Return401()
    {
        // Arrange
        var path = $"{_uriPath}/me";
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add(TestAuthHandler.UserIdHeader, "0");
        // Act
        var getResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
    }
}
