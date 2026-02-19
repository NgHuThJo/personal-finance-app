import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./balance-summary.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getApiBalancesOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

export function BalanceSummary() {
  const { data } = useSuspenseQuery({
    ...getApiBalancesOptions({
      client: clientWithAuth,
    }),
  });

  return (
    <ul className={styles.list}>
      <li className={`${styles["list-item"]} ${styles.balance}`}>
        <h3 className={styles["list-item-description"]}>Current Balance</h3>
        <span
          className={`${styles["list-item-value"]} ${styles["balance-value"]}`}
        >
          {numberFormatter.formatNumber({
            number: data.current,
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </li>
      <li className={styles["list-item"]}>
        <h3 className={styles["list-item-description"]}>Income</h3>
        <span className={styles["list-item-value"]}>
          {numberFormatter.formatNumber({
            number: data.income,
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </li>
      <li className={styles["list-item"]}>
        <h3 className={styles["list-item-description"]}>Expenses</h3>
        <span className={styles["list-item-value"]}>
          {numberFormatter.formatNumber({
            number: data.expense,
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </li>
    </ul>
  );
}
