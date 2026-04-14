import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import styles from "./table.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import {
  createRefreshTokenOptions,
  getAllRecurringBillsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
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
    data: { data: transactionData },
  } = useSuspenseQuery({
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

  const userId = Number(decodeJwt(accessToken?.accessToken as string).sub);

  return (
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
        {transactionData.length ? (
          transactionData.map(
            ({
              id,
              amount,
              transactionDate,
              otherUser: { name },
              senderId,
            }) => (
              <tr key={id}>
                <td>{name}</td>
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
  );
}
