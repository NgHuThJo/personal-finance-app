namespace backend.Shared;

public static partial class Log
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "{Email} is already in use"
    )]
    public static partial void LogEmailOfUser(ILogger logger, string email);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "User{Id} does not exist"
    )]
    public static partial void LogUserIdNotFound(ILogger logger, int id);
}
