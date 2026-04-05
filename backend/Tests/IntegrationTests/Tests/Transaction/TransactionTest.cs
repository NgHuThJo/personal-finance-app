using System.Net;
using System.Net.Http.Json;
using System.Runtime.Serialization;
using backend.Shared.Test;
using backend.Src.Models;
using FluentAssertions;
using Xunit;

namespace backend.Tests.IntegrationTests;

public class TransactionTest(DatabaseFixture fixture)
    : IntegrationTestBase(fixture)
{
    private readonly string _uriPath = "/v1/transactions";

    [Fact]
    public async Task CreateTransaction_IfSuccessful_Return204()
    {
        // Arrange
        var email = "somerandom@email.com";
        var dbContext = Db.CreateDbContext();
        var state = TestState
            .New(dbContext)
            .WithUser(
                u =>
                {
                    u.Email = email;
                },
                out User user
            );
        await state.Context.SaveChangesAsync(
            TestContext.Current.CancellationToken
        );

        var fakeData = TransactionFaker.CreateTransactionRequest() with
        {
            RecipientEmail = email,
        };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            _uriPath,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task CreateTransaction_IfSenderAndReceiverAreSameUser_Return400()
    {
        // Arrange
        var dbContext = Db.CreateDbContext();
        var state = TestState.New(dbContext);

        var fakeData = TransactionFaker.CreateTransactionRequest() with
        {
            RecipientEmail = state.DefaultUser.Email,
        };
        var jsonContent = JsonContent.Create(fakeData);
        var request = new HttpRequestMessage(HttpMethod.Post, _uriPath);
        request.Headers.Add(
            TestAuthHandler.UserIdHeader,
            state.DefaultUser.Id.ToString()
        );
        request.Content = jsonContent;
        // Act
        var postResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTransaction_IfEmailNotFound_Return422()
    {
        // Arrange
        var fakeData = TransactionFaker.CreateTransactionRequest() with
        {
            RecipientEmail = "somerandomnonexistent@email.com",
        };
        var jsonContent = JsonContent.Create(fakeData);
        // Act
        var postResponse = await Client.PostAsync(
            _uriPath,
            jsonContent,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse
            .StatusCode.Should()
            .Be(HttpStatusCode.UnprocessableContent);
    }

    [Fact]
    public async Task CreateTransaction_IfInsufficientFunds_Return422()
    {
        // Arrange
        var amount = 200;
        var email = "somerandom@email.com";
        var dbContext = Db.CreateDbContext();
        var state = TestState
            .New(dbContext)
            .WithUser(
                u =>
                {
                    u.Balance.Current = amount - 100;
                },
                out User sender
            )
            .WithUser(
                u =>
                {
                    u.Email = email;
                },
                out User recipient
            );
        await state.Context.SaveChangesAsync(
            TestContext.Current.CancellationToken
        );

        var fakeData = TransactionFaker.CreateTransactionRequest() with
        {
            Amount = amount,
            RecipientEmail = email,
        };
        var jsonContent = JsonContent.Create(fakeData);
        var request = new HttpRequestMessage(HttpMethod.Post, _uriPath);
        request.Headers.Add(TestAuthHandler.UserIdHeader, sender.Id.ToString());
        request.Content = jsonContent;
        // Act
        var postResponse = await Client.SendAsync(
            request,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse
            .StatusCode.Should()
            .Be(HttpStatusCode.UnprocessableContent);
    }

    [Fact]
    public async Task GetAllTransactions_IfSuccessful_Return200()
    {
        // Arrange
        // Act
        var postResponse = await Client.GetAsync(
            _uriPath,
            TestContext.Current.CancellationToken
        );
        // Assert
        postResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
