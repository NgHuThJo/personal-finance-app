using backend.Src.Models;

namespace backend.Shared.Test;

public abstract class TestState(AppDbContext context)
{
    public AppDbContext Context { get; init; } = context;
    public List<User> UserList { get; init; } = [];

    private void MaterializeUserList()
    {
        var users = Context.Users.ToList();

        UserList.AddRange(users);
    }

    public async Task SaveAndHydrateAsync()
    {
        await Context.SaveChangesAsync();
        MaterializeUserList();
    }
}
