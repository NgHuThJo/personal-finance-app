import styles from "./summary.module.css";

export function Summary() {
  return (
    <ul className={styles.layout}>
      <li>
        <h2>Current Balance</h2>
        <span></span>
      </li>
      <li>
        <h2>Income</h2>
        <span></span>
      </li>
      <li>
        <h2>Expenses</h2>
        <span></span>
      </li>
    </ul>
  );
}
