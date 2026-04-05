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
                                .UserFakerForSeeding()
                                .Generate(TestConstants.TESTDATA_ENTITY_COUNT);

                            var hasAnyElement = context.Set<User>().Any();

                            if (hasAnyElement)
                            {
                                return;
                            }

                            context.AddRange(users);

                            var random = new Random(
                                TestConstants.TESTDATA_DEV_DB_SEED
                            );

                            foreach (User user in users)
                            {
                                var sender = user;

                                for (
                                    int i = 0;
                                    i < TestConstants.TESTDATA_ENTITY_COUNT;
                                    i++
                                )
                                {
                                    int recipientIndex = default;

                                    do
                                    {
                                        recipientIndex = random.Next(
                                            users.Count
                                        );
                                    } while (sender == users[recipientIndex]);

                                    var transaction = TransactionFaker
                                        .TransactionFakerForSeeding(
                                            random.Next(int.MaxValue)
                                        )
                                        .Generate();

                                    transaction.Sender = sender;
                                    transaction.Recipient = users[
                                        recipientIndex
                                    ];

                                    context.Set<Transaction>().Add(transaction);
                                }
                            }

                            context.SaveChanges();
                        }
                    )
                    .UseAsyncSeeding(
                        async (context, _, ct) =>
                        {
                            var users = UserFaker
                                .UserFakerForSeeding()
                                .Generate(TestConstants.TESTDATA_ENTITY_COUNT);

                            var hasAnyElement = context.Set<User>().Any();

                            if (hasAnyElement)
                            {
                                return;
                            }

                            context.AddRange(users);

                            var random = new Random(
                                TestConstants.TESTDATA_DEV_DB_SEED
                            );

                            foreach (User user in users)
                            {
                                var sender = user;

                                for (
                                    int i = 0;
                                    i < TestConstants.TESTDATA_ENTITY_COUNT;
                                    i++
                                )
                                {
                                    int recipientIndex = default;

                                    do
                                    {
                                        recipientIndex = random.Next(
                                            users.Count
                                        );
                                    } while (sender == users[recipientIndex]);

                                    var transaction = TransactionFaker
                                        .TransactionFakerForSeeding(
                                            random.Next(int.MaxValue)
                                        )
                                        .Generate();

                                    transaction.Sender = sender;
                                    transaction.Recipient = users[
                                        recipientIndex
                                    ];

                                    context.Set<Transaction>().Add(transaction);
                                }
                            }

                            await context.SaveChangesAsync(ct);
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
