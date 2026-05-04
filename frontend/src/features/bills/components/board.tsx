import { Suspense } from "react";
import styles from "./board.module.css";
import { BillsPaginationLinks } from "#frontend/features/bills/components/pagination-links";
import { BillsSearchBar } from "#frontend/features/bills/components/searchbar";
import { BillsSortDropdown } from "#frontend/features/bills/components/sort-dropdown";
import { BillsSummary } from "#frontend/features/bills/components/summary";
import { BillsTable } from "#frontend/features/bills/components/table";
import { Spinner } from "#frontend/shared/primitives/spinner";

export function BillsBoard() {
  return (
    <div className={styles.layout}>
      <h1>Recurring Bills</h1>
      <div className={styles.content}>
        <Suspense
          fallback={
            <div className={styles["spinner-container"]}>
              <Spinner />
            </div>
          }
        >
          <BillsSummary />
        </Suspense>
        <div className={styles.table}>
          <div className={styles["filters"]}>
            <BillsSearchBar />
            <BillsSortDropdown />
          </div>
          <BillsTable />
          <BillsPaginationLinks />
        </div>
      </div>
    </div>
  );
}
