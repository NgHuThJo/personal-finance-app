using backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.IntegrationTests;

public class TestWebApplicationFactory(string connectionString)
    : WebApplicationFactory<Program>
{
    private readonly string _connectionString = connectionString;
    public HttpClient Client = null!;
    public WebApplicationFactory<Program> Factory = null!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services
                .AddAuthentication("TestScheme")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    "TestScheme",
                    options => { }
                );
        });

        builder.ConfigureServices(services =>
        {
            var descriptor = services.FirstOrDefault(s =>
                s.ServiceType == typeof(DbContextOptions<AppDbContext>)
            );

            if (descriptor is not null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(_connectionString);
            });
        });
    }
}
