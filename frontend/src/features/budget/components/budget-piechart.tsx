import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./budget-piechart.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import {
  getAllBudgetsOptions,
  getAllTransactionsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { getColorHexCode } from "#frontend/shared/utils/color";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

export function BudgetPieChart() {
  const { data: budgetData } = useSuspenseQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });
  //   const { data: categoryData } = useSuspenseQuery({
  //     ...getAllCategoriesOptions({
  //       client: clientWithAuth,
  //       credentials: "include",
  //     }),
  //   });
  const {
    data: { data: transactionData },
  } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });

  const aggregatedBudgetMaximum = budgetData.reduce((acc, curr) => {
    return acc + curr.maximum;
  }, 0);
  const aggregatedTransactionAmount = transactionData.reduce((acc, curr) => {
    return acc + curr.amount;
  }, 0);
  const pieChartArray = budgetData
    .reduce(
      (acc, curr) => {
        const lastPercent = acc.at(-1)?.[2] ?? 0;
        const percent = (curr.maximum / aggregatedBudgetMaximum) * 100;
        const hexColor = getColorHexCode(curr.themeColor);
        acc.push([hexColor, lastPercent, lastPercent + percent]);

        return acc;
      },
      [] as [string, number, number][],
    )
    .map(
      ([color, lastPercent, percent]) => `${color} ${lastPercent}% ${percent}%`,
    )
    .join(", ");

  return (
    <div
      className={styles["piechart"]}
      style={{
        backgroundImage: `conic-gradient(${pieChartArray})`,
      }}
    >
      <div className={styles["text-container"]}>
        <div className={styles["text"]}>
          {numberFormatter.formatNumber({
            number: aggregatedTransactionAmount,
            options: numberFormatter.getDollarOptions(),
          })}{" "}
          of{" "}
          {numberFormatter.formatNumber({
            number: aggregatedBudgetMaximum,
            options: numberFormatter.getDollarOptions(),
          })}{" "}
          limit
        </div>
      </div>
    </div>
  );
}
