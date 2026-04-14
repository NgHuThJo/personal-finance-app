import { Suspense } from "react";
import styles from "./summary.module.css";
import { CategoryFilter } from "#frontend/features/transaction/components/category-filter";
import { TransactionPaginationLinks } from "#frontend/features/transaction/components/pagination-links";
import { TransactionSearchBar } from "#frontend/features/transaction/components/searchbar";
import { SortDropdown } from "#frontend/features/transaction/components/sort-dropdown";
import { TransactionTable } from "#frontend/features/transaction/components/table";

import { Loader } from "#frontend/shared/primitives/loader";

export function TransactionSummary() {
  return (
    <div className={styles["layout"]}>
      <header className={styles["sort-header"]}>
        <TransactionSearchBar />
        <Suspense fallback={<Loader />}>
          <CategoryFilter />
        </Suspense>
        <SortDropdown />
      </header>
      <Suspense fallback={<Loader />}>
        <TransactionTable />
      </Suspense>
      <Suspense fallback={<Loader />}>
        <TransactionPaginationLinks />
      </Suspense>
    </div>
  );
}
