import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./board.module.css";
import { AddBudgetDialog } from "#frontend/features/budget/components/add-budget-dialog";
import { BudgetCard } from "#frontend/features/budget/components/budget-card";
import { BudgetSummary } from "#frontend/features/budget/components/budget-summary";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllBudgetsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";

export function BudgetBoard() {
  const { data: budgetData } = useSuspenseQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
    }),
  });

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Budgets</h1>
        <AddBudgetDialog />
      </header>
      {budgetData.length ? (
        <div className={styles["content"]}>
          <BudgetSummary />
          <ul className={styles.body}>
            {budgetData.map((budget) => (
              <BudgetCard key={budget.id} budgetData={budget} />
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
