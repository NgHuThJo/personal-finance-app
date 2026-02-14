import styles from "./balance-summary.module.css";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

export function BalanceSummary() {
  return (
    <ul className={styles.list}>
      <li className={`${styles["list-item"]} ${styles.balance}`}>
        <h3 className={styles["list-item-description"]}>Current Balance</h3>
        <span
          className={`${styles["list-item-value"]} ${styles["balance-value"]}`}
        >
          {numberFormatter.formatNumber({
            number: 0,
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </li>
      <li className={styles["list-item"]}>
        <h3 className={styles["list-item-description"]}>Income</h3>
        <span className={styles["list-item-value"]}>
          {numberFormatter.formatNumber({
            number: 0,
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </li>
      <li className={styles["list-item"]}>
        <h3 className={styles["list-item-description"]}>Expenses</h3>
        <span className={styles["list-item-value"]}>
          {numberFormatter.formatNumber({
            number: 0,
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </li>
    </ul>
  );
}
