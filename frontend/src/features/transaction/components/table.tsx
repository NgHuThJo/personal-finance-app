import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import styles from "./table.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import {
  createRefreshTokenOptions,
  getAllTransactionsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Skeleton } from "#frontend/shared/primitives/skeleton";
import { dateTimeFormatter } from "#frontend/shared/utils/intl/datetime-format";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";
import { decodeJwt } from "#frontend/shared/utils/object";

export function TransactionTable() {
  const route = getRouteApi("/_pathless-dashboard-layout/transactions");
  const { page, category, pageSize, sortKey, searchQuery } = route.useSearch();
  const { data: accessToken } = useQuery({
    ...createRefreshTokenOptions(),
    enabled: false,
  });
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
    return <Skeleton />;
  }
  if (error) {
    return <div>{error.detail}</div>;
  }

  const userId = Number(decodeJwt(accessToken?.accessToken as string).sub);

  return (
    <div className={styles["overflow-container"]}>
      <table className={styles["table"]}>
        <colgroup className={styles["colgroup"]}>
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th className={styles["table-header"]} scope="col">
              Sender / Recipient
            </th>
            <th className={styles["table-header"]} scope="col">
              Category
            </th>
            <th className={styles["table-header"]} scope="col">
              Transaction Date
            </th>
            <th className={styles["table-header"]} scope="col">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactionData?.data.length ? (
            transactionData.data.map(
              ({
                id,
                amount,
                category,
                transactionDate,
                otherUser: { name },
                senderId,
              }) => (
                <tr key={id}>
                  <td>{name}</td>
                  <td>{category}</td>
                  <td>
                    {dateTimeFormatter.formatDate({
                      date: new Date(transactionDate),
                    })}
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
              <td className={styles["no-transaction-found"]} colSpan={4}>
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
