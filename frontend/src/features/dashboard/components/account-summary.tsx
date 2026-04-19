import styles from "./account-summary.module.css";
import { DashboardBillsSummary } from "#frontend/features/dashboard/components/bills-summary";
import { DashboardBudgetSummary } from "#frontend/features/dashboard/components/budget-summary";
import { DashboardPotsSummary } from "#frontend/features/dashboard/components/pot-summary";
import { DashboardTransactionSummary } from "#frontend/features/dashboard/components/transaction-summary";

// Ensure that key is unique

export function AccountSummary() {
  return (
    <ul className={styles["list"]}>
      <DashboardPotsSummary />
      <DashboardTransactionSummary />
      <DashboardBudgetSummary />
      <DashboardBillsSummary />
    </ul>
  );
}
