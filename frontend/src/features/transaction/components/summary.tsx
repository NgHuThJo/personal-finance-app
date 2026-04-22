import { Suspense } from "react";
import styles from "./summary.module.css";
import { CategoryFilter } from "#frontend/features/transaction/components/category-filter";
import { TransactionPaginationLinks } from "#frontend/features/transaction/components/pagination-links";
import { TransactionSearchBar } from "#frontend/features/transaction/components/searchbar";
import { TransactionSortDropdown } from "#frontend/features/transaction/components/sort-dropdown";
import { TransactionTable } from "#frontend/features/transaction/components/table";

import { Skeleton } from "#frontend/shared/primitives/skeleton";

export function TransactionSummary() {
  return (
    <div className={styles["layout"]}>
      <header className={styles["sort-header"]}>
        <TransactionSearchBar />
        <Suspense fallback={<Skeleton width={100} height={50} />}>
          <CategoryFilter />
        </Suspense>
        <TransactionSortDropdown />
      </header>
      <TransactionTable />
      <Suspense fallback={<Skeleton height={100} />}>
        <TransactionPaginationLinks />
      </Suspense>
    </div>
  );
}
