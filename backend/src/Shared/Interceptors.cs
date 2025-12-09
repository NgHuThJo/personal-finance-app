using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace backend.Shared;

public interface IHasTimestamps
{
    DateTime Created { get; set; }
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
        var now = DateTime.Now;

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.Created = now;
            }
        }

        return base.SavingChanges(eventData, result);
    }
}
