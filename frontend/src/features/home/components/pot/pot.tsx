import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";

export function Pot() {
  const userId = useUserId();
  const {
    data: pots,
    isPending,
    isError,
    error,
  } = trpc.pot.getAllPots.useQuery({ userId });

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  const totalSavings =
    pots?.reduce((total, { totalAmount, savedAmount }) => {
      const totalAmountNum = Number(totalAmount) || 0;
      const savedAmountNum = Number(savedAmount) || 0;
      return total + (totalAmountNum - savedAmountNum);
    }, 0) ?? 0;

  return (
    <div>
      <p>{totalSavings.toFixed(2)}</p>
    </div>
  );
}
