namespace backend.Shared;

public static partial class Logger
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "{Email} is already in use"
    )]
    public static partial void LogEmailOfUser(ILogger logger, string email);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User{Id} does not exist"
    )]
    public static partial void LogUserIdNotFound(ILogger logger, int id);

    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled error")]
    public static partial void LogUnhandledException(
        ILogger logger,
        Exception exception
    );
}
