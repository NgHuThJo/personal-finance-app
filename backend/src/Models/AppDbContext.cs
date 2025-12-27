using backend.Shared;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public class AppDbContext(
    DbContextOptions options,
    TimestampInterceptor timestampInterceptor
) : DbContext(options)
{
    private readonly TimestampInterceptor _timeStampInterceptor =
        timestampInterceptor;

    // public DbSet<Board> Boards { get; set; }
    // public DbSet<BoardColumn> BoardColumns { get; set; }
    // public DbSet<KanbanTask> KanbanTasks { get; set; }
    // public DbSet<Subtask> SubTasks { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Balance> Balances { get; set; }
    public DbSet<Pot> Pots { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

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

        /* Transaction */
        modelBuilder
            .Entity<Transaction>()
            .Property(t => t.Amount)
            .HasPrecision(14, 2);
        modelBuilder
            .Entity<Transaction>()
            .HasOne(t => t.Sender)
            .WithMany(u => u.SentTransactions)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder
            .Entity<Transaction>()
            .HasOne(t => t.Recipient)
            .WithMany(u => u.ReceivedTransactions)
            .OnDelete(DeleteBehavior.SetNull);

        // modelBuilder.Entity<Board>().HasIndex(b => b.Name).IsUnique();

        // modelBuilder
        //     .Entity<BoardColumn>()
        //     .HasMany(b => b.KanbanTasks)
        //     .WithOne(k => k.BoardColumn)
        //     .HasForeignKey(k => k.BoardColumnId)
        //     .OnDelete(DeleteBehavior.Cascade);

        // modelBuilder
        //     .Entity<BoardColumn>()
        //     .HasIndex(b => new { b.BoardId, b.Name })
        //     .IsUnique();

        // modelBuilder
        //     .Entity<KanbanTask>()
        //     .HasMany(k => k.Subtasks)
        //     .WithOne(s => s.KanbanTask)
        //     .HasForeignKey(s => s.KanbanTaskId)
        //     .OnDelete(DeleteBehavior.Cascade);
    }
}
