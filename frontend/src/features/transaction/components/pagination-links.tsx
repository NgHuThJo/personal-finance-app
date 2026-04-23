import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import styles from "./pagination-links.module.css";
import { CaretLeft, CaretRight } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllTransactionsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { Skeleton } from "#frontend/shared/primitives/skeleton";
import {
  calculatePageCount,
  calculatePaginationWindow,
} from "#frontend/shared/utils/pagination";

export function TransactionPaginationLinks() {
  const route = getRouteApi("/_pathless-dashboard-layout/transactions");
  const { page, pageSize, category, searchQuery, sortKey } = route.useSearch();
  const {
    data: transactionData,
    isPending,
    error,
  } = useQuery({
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
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return <Skeleton height={100} />;
  }

  if (error) {
    return <div>{error.detail}</div>;
  }

  const pageCount = calculatePageCount({
    totalItemCount: transactionData.transactionCount,
    pageSize,
  });
  const { isPageEdgeAtEnd, isPageEdgeAtStart, leftPageEdge, pageWindowSize } =
    calculatePaginationWindow({
      page,
      pageCount,
      pageRange: 3,
    });

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
        {!isPageEdgeAtStart ? (
          <>
            <Link
              from="/transactions"
              to="."
              className={styles["link"]}
              search={(prev) => ({ ...prev, page: 1 })}
              activeProps={{
                className: styles["active-link"],
              }}
            >
              {1}
            </Link>
            <span>...</span>
          </>
        ) : null}
        {Array.from({
          length: pageWindowSize,
        }).map((_, index) => (
          <Link
            from="/transactions"
            to="."
            className={styles["link"]}
            search={(prev) => ({ ...prev, page: leftPageEdge + index })}
            activeProps={{
              className: styles["active-link"],
            }}
            key={index}
          >
            {leftPageEdge + index}
          </Link>
        ))}
        {!isPageEdgeAtEnd ? (
          <>
            <span>...</span>
            <Link
              from="/transactions"
              to="."
              className={styles["link"]}
              search={(prev) => ({ ...prev, page: pageCount })}
              activeProps={{
                className: styles["active-link"],
              }}
            >
              {pageCount}
            </Link>
          </>
        ) : null}
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
