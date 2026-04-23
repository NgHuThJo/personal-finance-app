import { useQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import styles from "./pagination-links.module.css";
import { CaretLeft, CaretRight } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllRecurringBillsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { Skeleton } from "#frontend/shared/primitives/skeleton";
import {
  calculatePageCount,
  calculatePaginationWindow,
} from "#frontend/shared/utils/pagination";

export function BillsPaginationLinks() {
  const route = getRouteApi("/_pathless-dashboard-layout/bills");
  const { page, pageSize, searchQuery, sortKey } = route.useSearch();
  const {
    data: transactionData,
    isPending,
    error,
  } = useQuery({
    ...getAllRecurringBillsOptions({
      client: clientWithAuth,
      credentials: "include",
      query: {
        page,
        pageSize,
        sortKey,
        searchQuery,
      },
    }),
  });

  if (isPending) {
    return <Skeleton height={100} />;
  }

  if (error) {
    return <p>{error.detail}</p>;
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
        from="/bills"
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
              from="/bills"
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
        {Array.from({ length: pageWindowSize }).map((_, index) => (
          <Link
            from="/bills"
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
      </div>
      {!isPageEdgeAtEnd ? (
        <>
          <span>...</span>
          <Link
            from="/bills"
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
      <Link
        from="/bills"
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
