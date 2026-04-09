import styles from "./board.module.css";
import { AddTransactionDialog } from "#frontend/features/transaction/components/add-transaction-dialog";
import { TransactionTable } from "#frontend/features/transaction/components/table";

export function TransactionBoard() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Budgets</h1>
        <AddTransactionDialog />
      </header>
      <div className={styles["content"]}>
        <TransactionTable />
      </div>
    </div>
  );
}
