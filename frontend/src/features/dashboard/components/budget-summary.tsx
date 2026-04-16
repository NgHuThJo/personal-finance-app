import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import styles from "./bills-summary.module.css";
import { CaretRight } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllBudgetsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { appLinkOptions } from "#frontend/shared/router/options/linkOptions";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

export function DashboardBudgetSummary() {
  const { data: budgetData } = useSuspenseQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });

  return (
    <div className={styles.layout}>
      <div className={styles["header"]}>
        <h2>Budgets</h2>
        <Link {...appLinkOptions.getBudgetOptions()} className={styles.link}>
          See Details
          <CaretRight />
        </Link>
      </div>
      <ul className={styles["list"]}>
        {budgetData.map((budget) => (
          <li className={styles["list-item"]} key={budget.id}>
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
  );
}
