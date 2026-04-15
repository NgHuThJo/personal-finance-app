import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import styles from "./transaction-summary.module.css";
import { CaretRight } from "#frontend/assets/icons/icons";
import { transactionRules } from "#frontend/features/transaction/rules/transaction-rules";
import { clientWithAuth } from "#frontend/shared/api/client";
import {
  createRefreshTokenOptions,
  getAllTransactionsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { appLinkOptions } from "#frontend/shared/router/options/linkOptions";
import { dateTimeFormatter } from "#frontend/shared/utils/intl/datetime-format";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";
import { decodeJwt } from "#frontend/shared/utils/object";

export function DashboardTransactionSummary() {
  const {
    data: { data: transactionData },
  } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
      credentials: "include",
      query: {
        page: 1,
        pageSize: 5,
      },
    }),
  });
  const { data: accessToken } = useQuery({
    ...createRefreshTokenOptions(),
    enabled: false,
  });

  const userId = Number(decodeJwt(accessToken?.accessToken as string).sub);

  return (
    <div className={styles.layout}>
      <div className={styles["header"]}>
        <h2>Transactions</h2>
        <Link
          {...appLinkOptions.getTransactionLinkOptions()}
          className={styles.link}
        >
          View All
          <CaretRight />
        </Link>
      </div>
      <ul className={styles["list"]}>
        {transactionData.map((transaction) => (
          <li className={styles["list-item"]} key={transaction.id}>
            <div>
              <span className={styles.name}>{transaction.otherUser.name}</span>
            </div>
            <div className={styles.metadata}>
              <span
                className={`${styles.amount} ${styles[transactionRules.isUserSender(userId, transaction.senderId) ? "minus" : "plus"]}`}
              >
                {transactionRules.isUserSender(userId, transaction.senderId)
                  ? "-"
                  : "+"}
                {numberFormatter.formatNumber({
                  number: transaction.amount,
                  options: numberFormatter.getDollarOptions(),
                })}
              </span>
              <span className={styles.date}>
                {dateTimeFormatter.formatDate({
                  date: new Date(transaction.transactionDate),
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
