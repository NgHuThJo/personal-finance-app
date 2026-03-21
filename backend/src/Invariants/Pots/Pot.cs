namespace backend.Src.Invariants;

public static class PotRules
{
    public static bool ExceedsTotal(decimal total, decimal draft) =>
        draft > total;

    public static bool ExceedsTarget(decimal total, decimal target) =>
        total > target;
}
