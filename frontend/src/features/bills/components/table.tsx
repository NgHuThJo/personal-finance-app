import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import styles from "./table.module.css";
import { DangerIcon, SuccessCheckIcon } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import {
  createRefreshTokenOptions,
  getAllRecurringBillsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Skeleton } from "#frontend/shared/primitives/skeleton";
import { dateTimeFormatter } from "#frontend/shared/utils/intl/datetime-format";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";
import { decodeJwt } from "#frontend/shared/utils/object";

export function BillsTable() {
  const route = getRouteApi("/_pathless-dashboard-layout/bills");
  const { page, pageSize, sortKey, searchQuery } = route.useSearch();
  const { data: accessToken } = useQuery({
    ...createRefreshTokenOptions(),
    enabled: false,
  });
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
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return <Skeleton />;
  }

  if (error) {
    return <p>{error.detail}</p>;
  }

  const userId = Number(decodeJwt(accessToken?.accessToken as string).sub);
  const extendedData = transactionData.data.map((transaction) => {
    const isTransactionDone =
      Date.now() >= new Date(transaction.transactionDate).getTime();

    return {
      ...transaction,
      isTransactionDone,
    };
  });

  return (
    <div className={styles["overflow-container"]}>
      <table className={styles["table"]}>
        <colgroup className={styles["colgroup"]}>
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th className={styles["table-header"]} scope="col">
              Bill Title
            </th>
            <th className={styles["table-header"]} scope="col">
              Due Date
            </th>
            <th className={styles["table-header"]} scope="col">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {extendedData.length ? (
            extendedData.map(
              ({
                id,
                amount,
                transactionDate,
                otherUser: { name },
                senderId,
                isTransactionDone,
              }) => (
                <tr key={id}>
                  <td>{name}</td>
                  <td
                    className={`${styles["transaction-date"]} ${styles[isTransactionDone ? "paid" : "due"]}`}
                  >
                    {dateTimeFormatter.formatDate({
                      date: new Date(transactionDate),
                    })}
                    {isTransactionDone ? <SuccessCheckIcon /> : <DangerIcon />}
                  </td>
                  <td
                    className={`${styles["table-cell-amount"]} ${userId === senderId ? styles["minus"] : styles["plus"]}`}
                  >
                    {userId === senderId ? "-" : "+"}
                    {numberFormatter.formatNumber({
                      number: amount,
                      options: numberFormatter.getDollarOptions(),
                    })}
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td className={styles["no-transaction-found"]} colSpan={3}>
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
