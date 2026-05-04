import { Suspense } from "react";
import styles from "./summary.module.css";
import { CategoryFilter } from "#frontend/features/transaction/components/category-filter";
import { TransactionPaginationLinks } from "#frontend/features/transaction/components/pagination-links";
import { TransactionSearchBar } from "#frontend/features/transaction/components/searchbar";
import { TransactionSortDropdown } from "#frontend/features/transaction/components/sort-dropdown";
import { TransactionTable } from "#frontend/features/transaction/components/table";

import { Spinner } from "#frontend/shared/primitives/spinner";

export function TransactionSummary() {
  return (
    <div className={styles["layout"]}>
      <header className={styles["sort-header"]}>
        <TransactionSearchBar />
        <div className={styles["spinner-container"]}>
          <Suspense fallback={<Spinner />}>
            <CategoryFilter />
          </Suspense>
        </div>
        <TransactionSortDropdown />
      </header>
      <TransactionTable />
      <Suspense
        fallback={
          <div className={styles["spinner-container"]}>
            <Spinner />
          </div>
        }
      >
        <TransactionPaginationLinks />
      </Suspense>
    </div>
  );
}
