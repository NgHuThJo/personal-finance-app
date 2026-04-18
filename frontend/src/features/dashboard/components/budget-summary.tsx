import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import styles from "./budget-summary.module.css";
import { CaretRight } from "#frontend/assets/icons/icons";
import { BudgetPieChart } from "#frontend/features/budget/components/budget-piechart";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllBudgetsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { appLinkOptions } from "#frontend/shared/router/options/linkOptions";
import { getColorHexCode } from "#frontend/shared/utils/color";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

export function DashboardBudgetSummary() {
  const { data: budgetData } = useSuspenseQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });

  const slicedData = budgetData.slice(0, 4);

  return (
    <div className={styles.layout}>
      <div className={styles["header"]}>
        <h2>Budgets</h2>
        <Link {...appLinkOptions.getBudgetOptions()} className={styles.link}>
          See Details
          <CaretRight />
        </Link>
      </div>
      <div className={styles["piechart-layout"]}>
        <BudgetPieChart />
        <ul className={styles["list"]}>
          {slicedData.map((budget) => (
            <li className={styles["list-item"]} key={budget.id}>
              <span
                className={styles["theme-icon"]}
                style={{
                  "--color-theme-icon": getColorHexCode(budget.themeColor),
                }}
              ></span>
              <span className={styles["key"]}>{budget.category}</span>
              <span className={styles["amount"]}>
                {numberFormatter.formatNumber({
                  number: budget.maximum,
                  options: numberFormatter.getDollarOptions(),
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
