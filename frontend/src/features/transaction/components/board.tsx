import styles from "./board.module.css";
import { AddTransactionDialog } from "#frontend/features/transaction/components/add-transaction-dialog";
import { TransactionSummary } from "#frontend/features/transaction/components/summary";

export function TransactionBoard() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Transactions</h1>
        <AddTransactionDialog />
      </header>
      <TransactionSummary />
    </div>
  );
}
