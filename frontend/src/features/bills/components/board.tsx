import { Suspense } from "react";
import styles from "./board.module.css";
import { BillsPaginationLinks } from "#frontend/features/bills/components/pagination-links";
import { BillsSearchBar } from "#frontend/features/bills/components/searchbar";
import { BillsSortDropdown } from "#frontend/features/bills/components/sort-dropdown";
import { BillsSummary } from "#frontend/features/bills/components/summary";
import { BillsTable } from "#frontend/features/bills/components/table";
import { Loader } from "#frontend/shared/primitives/loader";

export function BillsBoard() {
  return (
    <div className={styles.layout}>
      <h1>Recurring Bills</h1>
      <div className={styles.content}>
        <Suspense fallback={<Loader />}>
          <BillsSummary />
        </Suspense>
        <div className={styles.table}>
          <div className={styles["filters"]}>
            <BillsSearchBar />
            <BillsSortDropdown />
          </div>
          <Suspense fallback={<Loader />}>
            <BillsTable />
          </Suspense>
          <Suspense fallback={<Loader />}>
            <BillsPaginationLinks />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
