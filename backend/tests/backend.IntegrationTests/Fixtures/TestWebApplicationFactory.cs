using backend.Models;
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
    public string DefaultUserId { get; set; } = "1";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Set this property to this class's property value whenever a TestAuthHandlerOptions is instantiated somewhere
            services.Configure<TestAuthHandlerOptions>(options =>
                options.DefaultUserId = DefaultUserId
            );

            services
                .AddAuthentication("TestScheme")
                .AddScheme<TestAuthHandlerOptions, TestAuthHandler>(
                    "TestScheme",
                    options => { }
                );

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
