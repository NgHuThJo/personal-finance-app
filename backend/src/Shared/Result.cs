namespace backend.Src.Shared;

public readonly struct Unit
{
    public static readonly Unit Value = new();
}

public readonly struct Result<T, E>
{
    private readonly bool _isSuccess;
    private readonly T _value;
    private readonly E _error;

    private Result(T value)
    {
        _isSuccess = true;
        _value = value;
        _error = default!;
    }

    private Result(E error)
    {
        _isSuccess = false;
        _value = default!;
        _error = error;
    }

    public static Result<T, E> Ok(T value) => new(value);

    public static Result<T, E> Fail(E error) => new(error);

    public bool IsSuccess => _isSuccess;

    public T Value =>
        _isSuccess
            ? _value
            : throw new InvalidOperationException("No value present");

    public E Error =>
        !_isSuccess
            ? _error
            : throw new InvalidOperationException("No error present");

    public Result<K, E> Bind<K>(Func<T, Result<K, E>> func)
    {
        return _isSuccess ? func(_value) : Result<K, E>.Fail(_error);
    }

    public Result<K, E> Map<K>(Func<T, K> map)
    {
        return _isSuccess
            ? Result<K, E>.Ok(map(_value))
            : Result<K, E>.Fail(_error);
    }

    public K Match<K>(Func<T, K> onSuccess, Func<E, K> onFailure)
    {
        return _isSuccess ? onSuccess(_value) : onFailure(_error);
    }
}
