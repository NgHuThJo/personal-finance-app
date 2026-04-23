import { useQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import styles from "./pagination-links.module.css";
import { CaretLeft, CaretRight } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllRecurringBillsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { Skeleton } from "#frontend/shared/primitives/skeleton";

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

  const pageCount = Math.ceil(transactionData?.transactionCount / pageSize);

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
        {Array.from({ length: pageCount }).map((_, index) => (
          <Link
            from="/bills"
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
