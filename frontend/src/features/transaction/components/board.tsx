import { Suspense } from "react";
import styles from "./board.module.css";
import { AddTransactionDialog } from "#frontend/features/transaction/components/add-transaction-dialog";
import { TransactionTable } from "#frontend/features/transaction/components/table";
import { Loader } from "#frontend/shared/primitives/loader";

export function TransactionBoard() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Budgets</h1>
        <AddTransactionDialog />
      </header>
      <Suspense fallback={<Loader />}>
        <TransactionTable />
      </Suspense>
    </div>
  );
}
