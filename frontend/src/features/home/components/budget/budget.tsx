import { Link } from "react-router-dom";
import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";
import { CardLayout } from "#frontend/features/home/components/layouts/card-layout";
import styles from "./budget.module.css";

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
    <CardLayout className="light">
      <div className={styles.top}>
        <h2>Budgets</h2>
        <Link to="budgets">See Details</Link>
      </div>
      <p>${totalSpentMoney.toFixed(2)}</p>
      <p>of ${totalBudget.toFixed(2)} limit</p>
    </CardLayout>
  );
}
