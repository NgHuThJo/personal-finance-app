import { Suspense } from "react";
import styles from "./board.module.css";
import { BillsPaginationLinks } from "#frontend/features/bills/components/pagination-links";
import { BillsSearchBar } from "#frontend/features/bills/components/searchbar";
import { BillsSortDropdown } from "#frontend/features/bills/components/sort-dropdown";
import { BillsSummary } from "#frontend/features/bills/components/summary";
import { BillsTable } from "#frontend/features/bills/components/table";
import { Skeleton } from "#frontend/shared/primitives/skeleton";

export function BillsBoard() {
  return (
    <div className={styles.layout}>
      <h1>Recurring Bills</h1>
      <div className={styles.content}>
        <Suspense fallback={<Skeleton height={200} />}>
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
