using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    // public DbSet<Board> Boards { get; set; }
    // public DbSet<BoardColumn> BoardColumns { get; set; }
    // public DbSet<KanbanTask> KanbanTasks { get; set; }
    // public DbSet<Subtask> SubTasks { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Balance> Balances { get; set; }
    public DbSet<Pot> Pots { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        modelBuilder
            .Entity<User>()
            .HasOne(u => u.Balance)
            .WithOne(b => b.User)
            .HasForeignKey<Balance>(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

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
