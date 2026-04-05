import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./board.module.css";
import { BudgetCard } from "#frontend/features/budget/components/budget-card";
import { clientWithAuth } from "#frontend/shared/api/client";
import type { Category } from "#frontend/shared/client";
import {
  getAllBudgetsOptions,
  getAllCategoriesOptions,
  getAllTransactionsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";

export function BudgetBoard() {
  const { data: budgetData } = useSuspenseQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
    }),
  });
  const { data: categories } = useSuspenseQuery({
    ...getAllCategoriesOptions({
      client: clientWithAuth,
    }),
  });
  const { data: transactionData } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
    }),
  });

  const transactionAmountByCategory = transactionData.reduce(
    (prev, curr) => {
      prev[curr.category] += curr.amount;

      return prev;
    },
    categories.reduce(
      (prev, curr) => {
        prev[curr] = 0;
        return prev;
      },
      {} as Record<Category, number>,
    ),
  );

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Budgets</h1>
      </header>
      {budgetData.length ? (
        <div>
          <div></div>
          <ul className={styles.body}>
            {budgetData.map((budget) => (
              <BudgetCard
                key={budget.id}
                budgetData={budget}
                transactionAmount={transactionAmountByCategory[budget.category]}
              />
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
