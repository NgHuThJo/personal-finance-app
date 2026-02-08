import styles from "./balance-summary.module.css";

export function BalanceSummary() {
  return (
    <ul className={styles.list}>
      <li className={`${styles["list-item"]} ${styles.balance}`}>
        <h3 className={styles["list-item-description"]}>Current Balance</h3>
        <span
          className={`${styles["list-item-value"]} ${styles["balance-value"]}`}
        >
          $0
        </span>
      </li>
      <li className={styles["list-item"]}>
        <h3 className={styles["list-item-description"]}>Income</h3>
        <span className={styles["list-item-value"]}>$0</span>
      </li>
      <li className={styles["list-item"]}>
        <h3 className={styles["list-item-description"]}>Expenses</h3>
        <span className={styles["list-item-value"]}>$0</span>
      </li>
    </ul>
  );
}
