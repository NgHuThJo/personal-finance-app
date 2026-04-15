import styles from "./account-summary.module.css";
import { DashboardBillsSummary } from "#frontend/features/dashboard/components/bills-summary";
import { DashboardTransactionSummary } from "#frontend/features/dashboard/components/transaction-summary";

// Ensure that key is unique

export function AccountSummary() {
  return (
    <ul className={styles["list"]}>
      <DashboardTransactionSummary />
      <DashboardBillsSummary />
      <div className={styles["list-item-content"]}>
        <p>No data provided.</p>
      </div>
    </ul>
  );
}
