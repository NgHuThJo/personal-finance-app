// using System.Net.Http.Headers;
// using backend.IntegrationTests;
// using backend.Models;
// using DotNet.Testcontainers.Builders;
// using DotNet.Testcontainers.Configurations;
// using Microsoft.AspNetCore.Authentication;
// using Microsoft.AspNetCore.Mvc.Testing;
// using Microsoft.AspNetCore.TestHost;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.Extensions.DependencyInjection;
// using Testcontainers.PostgreSql;
// using Xunit;

// [assembly: AssemblyFixture(typeof(SetupTestFixture))]

// namespace backend.IntegrationTests;

// // Extend this with every test class
// public class SetupTestFixture : IAsyncLifetime
// {
//     public WebApplicationFactory<Program> Factory { get; private set; } = null!;
//     public PostgreSqlContainer DbContainer { get; private set; } = null!;
//     public HttpClient Client { get; private set; } = null!;

//     public async ValueTask InitializeAsync()
//     {
//         // Check if Docker is running
//         if (TestcontainersSettings.OS.DockerEndpointAuthConfig is null)
//         {
//             throw new DockerUnavailableException("Docker is not available");
//         }

//         DbContainer = new PostgreSqlBuilder()
//             .WithImage("postgres:latest")
//             .WithDatabase("testdb")
//             .WithReuse(true)
//             .WithLabel("reuse-id", "personal-finance-app-integration-test")
//             .Build();
//         await DbContainer.StartAsync();

//         var connectionString = DbContainer.GetConnectionString();

//         Factory = new WebApplicationFactory<Program>().WithWebHostBuilder(
//             builder =>
//             {
//                 builder.ConfigureTestServices(services =>
//                 {
//                     services
//                         .AddAuthentication("TestScheme")
//                         .AddScheme<
//                             AuthenticationSchemeOptions,
//                             TestAuthHandler
//                         >("TestScheme", options => { });
//                 });

//                 builder.ConfigureServices(services =>
//                 {
//                     var dbContextService = services.SingleOrDefault(d =>
//                         d.ServiceType == typeof(DbContextOptions<AppDbContext>)
//                     );

//                     if (dbContextService is not null)
//                     {
//                         services.Remove(dbContextService);
//                     }

//                     services.AddDbContext<AppDbContext>(options =>
//                         options
//                             .UseNpgsql(connectionString)
//                             .UseAsyncSeeding(
//                                 async (context, _, cancellationToken) =>
//                                 {
//                                     // await context.Database.EnsureDeletedAsync();
//                                     // await context.Database.EnsureCreatedAsync();

//                                     var fakeUsers = UserFaker
//                                         .CreateUserFaker()
//                                         .UseSeed(TestConstants.TESTDATA_SEED);

//                                     var newUsers = fakeUsers.Generate(5);
//                                     var contains = await context
//                                         .Set<User>()
//                                         .ContainsAsync(
//                                             newUsers[0],
//                                             cancellationToken
//                                         );

//                                     if (!contains)
//                                     {
//                                         context.Set<User>().AddRange(newUsers);
//                                         await context.SaveChangesAsync(
//                                             cancellationToken
//                                         );
//                                     }
//                                 }
//                             )
//                     );
//                 });

//                 Environment.SetEnvironmentVariable(
//                     "ConnectionStrings:PostgresConnection",
//                     connectionString
//                 );
//             }
//         );

//         // Ensure that you can access any endpoint
//         Client = Factory.CreateClient(new() { AllowAutoRedirect = false });
//         Client.DefaultRequestHeaders.Authorization =
//             new AuthenticationHeaderValue("TestScheme");
//         // Ensure that db is created

//         using var scope = Factory.Services.CreateScope();
//         var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//         await db.Database.EnsureDeletedAsync();
//         await db.Database.EnsureCreatedAsync();
//     }

//     public async ValueTask DisposeAsync()
//     {
//         if (DbContainer is not null)
//         {
//             await DbContainer.StopAsync();
//         }

//         Factory?.Dispose();
//     }
// }
