// See https://aka.ms/new-console-template for more information
using backend.Shared.Test;
using backend.Src.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace backend.DatabaseSeeding
{
    class DatabaseSeedingProgram
    {
        static async Task Main(string[] _)
        {
            var hostBuilder = Host.CreateApplicationBuilder();
            var config = hostBuilder.Configuration.GetSection(
                "ConnectionStrings"
            );
            var assembly = typeof(Program).Assembly;

            var interceptorTypes = assembly
                .GetTypes()
                .Where(t =>
                    t.IsClass && !t.IsAbstract && t.Name.EndsWith("Interceptor")
                );

            foreach (var interceptorType in interceptorTypes)
            {
                hostBuilder.Services.AddScoped(interceptorType);
            }

            hostBuilder.Services.AddDbContext<AppDbContext>(options =>
            {
                options
                    .UseNpgsql(config["PostgresConnection"])
                    .UseSeeding(
                        (context, _) =>
                        {
                            var users = UserFaker
                                .BaseUserFaker()
                                .Generate(
                                    TestConstants.TESTDATA_NUMBER_OF_USERS
                                );

                            var contains = context.Set<User>().FirstOrDefault();

                            if (contains is null)
                            {
                                context.AddRange(users);
                                context.SaveChanges();
                            }
                        }
                    )
                    .UseAsyncSeeding(
                        async (context, _, cancellationToken) =>
                        {
                            var users = UserFaker
                                .BaseUserFaker()
                                .Generate(
                                    TestConstants.TESTDATA_NUMBER_OF_USERS
                                );

                            var contains = await context
                                .Set<User>()
                                .FirstOrDefaultAsync(
                                    cancellationToken: cancellationToken
                                );

                            if (contains is null)
                            {
                                context.AddRange(users);
                                await context.SaveChangesAsync(
                                    cancellationToken
                                );
                            }
                        }
                    );
            });

            var app = hostBuilder.Build();

            await using var scope = app.Services.CreateAsyncScope();
            await using var dbContext =
                scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await dbContext.Database.EnsureCreatedAsync();

            Console.WriteLine("Seeding successful");
        }
    }
}
