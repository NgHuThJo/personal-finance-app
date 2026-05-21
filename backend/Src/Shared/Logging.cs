namespace backend.Src.Shared;

public static partial class GlobalLogger
{
    // Logging for global exception handler
    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled error")]
    public static partial void LogUnhandledException(
        ILogger logger,
        Exception exception
    );
}
