using backend.Src.Models;

namespace backend.Shared.Test;

public class TestState
{
    public AppDbContext Context { get; init; }
    public List<User> UserList { get; init; } = [];
    public User DefaultUser { get; set; } = null!;

    private TestState(AppDbContext context)
    {
        Context = context;
    }

    public static TestState New(AppDbContext context)
    {
        var state = new TestState(context);
        state.Initialize();
        state.MaterializeUserList();

        return state;
    }

    private void Initialize()
    {
        if (Context is null)
        {
            throw new InvalidOperationException(
                $"DbContext is not initialized before calling {nameof(Initialize)}"
            );
        }

        this.WithUser(u => { }, out User newUser);
        Context.SaveChanges();

        DefaultUser = newUser;
    }

    private void MaterializeUserList()
    {
        var users = Context.Users.ToList();

        UserList.AddRange(users);
    }

    public async Task SaveAsync()
    {
        await Context.SaveChangesAsync();
    }
}
