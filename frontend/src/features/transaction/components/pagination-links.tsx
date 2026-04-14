import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import styles from "./pagination-links.module.css";
import { CaretLeft, CaretRight } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllTransactionsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";

export function TransactionPaginationLinks() {
  const route = getRouteApi("/_pathless-dashboard-layout/transactions");
  const { page, pageSize, category, searchQuery, sortKey } = route.useSearch();
  const {
    data: { transactionCount },
  } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
      credentials: "include",
      query: {
        page,
        pageSize,
        category,
        sortKey,
        searchQuery,
      },
    }),
  });

  const pageCount = Math.ceil(transactionCount / pageSize);

  return (
    <div className={styles["pagination-layout"]}>
      <Link
        from="/transactions"
        to="."
        search={(prev) => ({ ...prev, page: page - 1 })}
        disabled={page <= 1}
        className={styles["next-back-link"]}
      >
        <CaretLeft />
        Back
      </Link>
      <div className={styles["pagination-button-layout"]}>
        {Array.from({ length: pageCount }).map((_, index) => (
          <Link
            from="/transactions"
            to="."
            className={styles["link"]}
            search={(prev) => ({ ...prev, page: index + 1 })}
            activeProps={{
              className: styles["active-link"],
            }}
            key={index}
          >
            {index + 1}
          </Link>
        ))}
      </div>
      <Link
        from="/transactions"
        to="."
        search={(prev) => ({ ...prev, page: page + 1 })}
        disabled={page >= pageCount}
        className={styles["next-back-link"]}
      >
        Next
        <CaretRight />
      </Link>
    </div>
  );
}
