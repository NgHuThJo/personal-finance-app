import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";

const zeroString = Number(0).toFixed(2);

export function Balance() {
  const userId = useUserId();
  const {
    data: balance,
    isPending,
    isError,
    error,
  } = trpc.account.getBalance.useQuery({ userId });
  const difference = balance
    ? (Number(balance.income) - Number(balance.expense)).toFixed(2)
    : zeroString;
  const income = balance?.income ?? zeroString;
  const expense = balance?.expense ?? zeroString;

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  return (
    <div>
      <div>
        <h2>Current balance</h2>
        <span>${difference}</span>
      </div>
      <div>
        <h2>Income</h2>
        <span>${income}</span>
      </div>
      <div>
        <h2>Expenses</h2>
        <span>${expense}</span>
      </div>
    </div>
  );
}
