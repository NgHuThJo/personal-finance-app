import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./budget-summary.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import type { Category } from "#frontend/shared/client";
import {
  getAllBudgetsOptions,
  getAllCategoriesOptions,
  getAllTransactionsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

export function BudgetSummary() {
  const { data: budgetData } = useSuspenseQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });
  const { data: categoryData } = useSuspenseQuery({
    ...getAllCategoriesOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });
  const { data: transactionData } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });

  const result = Object.fromEntries(
    categoryData.map((category) => [
      category,
      {
        category,
        sumTransactionAmount: 0,
        sumBudgetMaximum: 0,
      },
    ]),
  ) as Record<
    Category,
    {
      category: Category;
      sumTransactionAmount: number;
      sumBudgetMaximum: number;
    }
  >;

  for (const b of budgetData) {
    result[b.category].sumBudgetMaximum += b.maximum;
  }

  for (const t of transactionData) {
    result[t.category].sumTransactionAmount += t.amount;
  }

  const aggregatedData = Object.values(result).filter(
    (value) => value.sumBudgetMaximum > 0,
  );

  return (
    <div className={styles.layout}>
      <h1>Spending Summary</h1>
      <ul className={styles["summary"]}>
        {aggregatedData?.map(
          ({ category, sumBudgetMaximum, sumTransactionAmount }) => (
            <li className={styles.category}>
              <p className={styles["category-label"]}>
                {capitalizeFirstLetter(category)}
              </p>
              <p>
                <span className={styles["transaction-amount"]}>
                  {numberFormatter.formatNumber({
                    number: sumTransactionAmount,
                    options: numberFormatter.getDollarOptions(),
                  })}
                </span>
                &nbsp;of
                <span>
                  &nbsp;
                  {numberFormatter.formatNumber({
                    number: sumBudgetMaximum,
                    options: numberFormatter.getDollarOptions(),
                  })}
                </span>
              </p>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
