import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import styles from "./table.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import {
  createRefreshTokenOptions,
  getAllTransactionsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Image } from "#frontend/shared/primitives/image";
import { Spinner } from "#frontend/shared/primitives/spinner";
import { diceBearerHelper } from "#frontend/shared/utils/avatar";
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
    select: (prev) => {
      return {
        ...prev,
        data: prev.data.map((transaction) => {
          const { avatarSeed, avatarStyle, ...rest } = transaction.otherUser;

          return {
            ...transaction,
            otherUser: {
              ...rest,
              avatar: diceBearerHelper.createAvatarString(
                avatarStyle,
                avatarSeed,
              ),
            },
          };
        }),
      };
    },
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return (
      <div className={styles["spinner-container"]}>
        <Spinner />
      </div>
    );
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
                otherUser: { name, avatar },
                senderId,
              }) => (
                <tr key={id}>
                  <td>
                    <Image
                      className="icon-sm"
                      src={avatar}
                      alt="avatar image"
                    />
                    <span>{name}</span>
                  </td>
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
