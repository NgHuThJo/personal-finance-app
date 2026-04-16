using backend.Src.Shared;
using Microsoft.EntityFrameworkCore;

namespace backend.Src.Models;

public class AppDbContext(
    DbContextOptions options,
    TimestampInterceptor timestampInterceptor
) : DbContext(options)
{
    private readonly TimestampInterceptor _timeStampInterceptor =
        timestampInterceptor;

    public DbSet<User> Users { get; set; }
    public DbSet<Balance> Balances { get; set; }
    public DbSet<Pot> Pots { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<UserAuthProvider> UserAuthProviders { get; set; }

    protected override void OnConfiguring(
        DbContextOptionsBuilder optionsBuilder
    )
    {
        optionsBuilder.AddInterceptors(_timeStampInterceptor);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        /* User */
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder
            .Entity<User>()
            .HasOne(u => u.Balance)
            .WithOne(b => b.User)
            .HasForeignKey<Balance>(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        /* Pot */
        modelBuilder.Entity<Pot>(p =>
        {
            p.Property(p => p.Total).HasPrecision(14, 2);
            p.Property(p => p.Target).HasPrecision(14, 2);

            p.HasIndex(p => new { p.UserId, p.Name }).IsUnique();
        });

        /* Budget */
        modelBuilder.Entity<Budget>(b =>
        {
            b.Property(b => b.Maximum).HasPrecision(14, 2);
        });

        /* Transaction */
        modelBuilder
            .Entity<Transaction>()
            .Property(t => t.Amount)
            .HasPrecision(14, 2);
        modelBuilder
            .Entity<Transaction>()
            .HasOne(t => t.Sender)
            .WithMany(u => u.SentTransactions)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder
            .Entity<Transaction>()
            .HasOne(t => t.Recipient)
            .WithMany(u => u.ReceivedTransactions)
            .OnDelete(DeleteBehavior.Restrict);

        /* RefreshToken */
        modelBuilder
            .Entity<RefreshToken>()
            .Property(r => r.Token)
            .HasMaxLength(200);
        modelBuilder.Entity<RefreshToken>().HasIndex(r => r.Token).IsUnique();

        /* UserAuthProvider */
        modelBuilder
            .Entity<UserAuthProvider>()
            .HasIndex(u => new { u.Provider, u.ProviderUserId })
            .IsUnique();
    }
}
