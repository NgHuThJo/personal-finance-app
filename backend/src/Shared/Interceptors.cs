using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace backend.Src.Shared;

public interface IHasTimestamps
{
    DateTimeOffset Created { get; set; }
}

public class TimestampInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result
    )
    {
        var context = eventData.Context;

        if (context == null)
        {
            return result;
        }

        var entries = context.ChangeTracker.Entries<IHasTimestamps>();
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.Created = now;
            }
        }

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken ct
    )
    {
        var context = eventData.Context;

        if (context == null)
        {
            return ValueTask.FromResult(result);
        }

        var entries = context.ChangeTracker.Entries<IHasTimestamps>();
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.Created = now;
            }
        }

        return base.SavingChangesAsync(eventData, result, ct);
    }
}
