import styles from "./top-summary.module.css";

export function TopSummary() {
  return (
    <ul className={styles.layout}>
      <li className={styles["list-item"]}>
        <h3>Current Balance</h3>
        <span>$0</span>
      </li>
      <li className={styles["list-item"]}>
        <h3>Income</h3>
        <span>$0</span>
      </li>
      <li className={styles["list-item"]}>
        <h3>Expenses</h3>
        <span>$0</span>
      </li>
    </ul>
  );
}
