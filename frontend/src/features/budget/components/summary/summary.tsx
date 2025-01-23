import { BudgetQueryOutput } from "#frontend/types/trpc";
import styles from "./summary.module.css";

type BudgetSummaryProps = {
  budgets: BudgetQueryOutput[] | undefined;
};

export function BudgetSummary({ budgets }: BudgetSummaryProps) {
  const totalSpent = budgets?.reduce(
    (prev, curr) => prev + Number(curr.spentAmount),
    0,
  );
  const maxAmount = budgets?.reduce(
    (prev, curr) => prev + Number(curr.maxAmount),
    0,
  );

  return (
    <div className={styles.container}>
      <div className={styles.chart}>
        <p>{`$${totalSpent} of $${maxAmount} limit`}</p>
      </div>
      <div>
        <h2>Spending Summary</h2>
        <ul>
          {budgets?.map((budget, index) => (
            <li key={index}>
              <span>{budget.category}</span>
              <p>
                <span>${budget.spentAmount}</span> of ${budget.maxAmount}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
