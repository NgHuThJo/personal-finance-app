import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";

export function Budget() {
  const userId = useUserId();
  const { data, error, isPending, isError } =
    trpc.budget.getAllBudgets.useQuery({ userId });

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  let [totalBudget, totalSpentMoney] = [0, 0];

  if (data) {
    data.forEach(({ maxAmount, spentAmount }) => {
      const maxAmountNum = Number(maxAmount) || 0;
      const spentAmountNum = Number(spentAmount) || 0;

      totalBudget += maxAmountNum;
      totalSpentMoney += spentAmountNum;
    });
  }

  return (
    <div>
      <p>{totalSpentMoney}</p>
      <p>{totalBudget}</p>
    </div>
  );
}
