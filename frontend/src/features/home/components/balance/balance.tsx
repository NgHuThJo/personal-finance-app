import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";
import { CardLayout } from "#frontend/features/home/components/layouts/card-layout";
import styles from "./balance.module.css";

const zeroString = Number(0).toFixed(2);

export function Balance() {
  const userId = useUserId();
  const {
    data: balance,
    isPending,
    error,
  } = trpc.account.getBalance.useQuery({ userId });
  const income = balance?.income ?? zeroString;
  const expense = balance?.expense ?? zeroString;
  const difference = balance
    ? (Number(balance.income) - Number(balance.expense)).toFixed(2)
    : zeroString;

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div className={styles.container}>
      <CardLayout className="dark">
        <h2>Current balance</h2>
        <span>${difference}</span>
      </CardLayout>
      <CardLayout className="light">
        <h2>Income</h2>
        <span>${income}</span>
      </CardLayout>
      <CardLayout className="light">
        <h2>Expenses</h2>
        <span>${expense}</span>
      </CardLayout>
    </div>
  );
}
