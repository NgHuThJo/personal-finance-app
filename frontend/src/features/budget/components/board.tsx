import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./board.module.css";
import { BudgetCard } from "#frontend/features/budget/components/budget-card";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllBudgetsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";

export function BudgetBoard() {
  const { data } = useSuspenseQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
    }),
  });

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Budgets</h1>
      </header>
      {data.length ? (
        <div>
          <div></div>
          <ul className={styles.body}>
            {data.map((budget) => (
              <BudgetCard budgetData={budget} />
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles["status-report"]}>
          You have not created a pot yet.
        </p>
      )}
    </div>
  );
}
