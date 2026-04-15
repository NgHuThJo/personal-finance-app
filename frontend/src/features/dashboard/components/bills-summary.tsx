import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import styles from "./bills-summary.module.css";
import { CaretRight } from "#frontend/assets/icons/icons";
import { billRules } from "#frontend/features/bills/rules/bill-rules";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllRecurringBillsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { appLinkOptions } from "#frontend/shared/router/options/linkOptions";
import type { KeyValueTuple } from "#frontend/shared/types/miscellaneous";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

type DashboardBillSummary = {
  [K in "Paid Bills" | "Total Upcoming"]: {
    amount: number;
  };
};

export function DashboardBillsSummary() {
  const {
    data: { data: transactionData },
  } = useSuspenseQuery({
    ...getAllRecurringBillsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });

  const billSummaryMap = transactionData.reduce(
    (acc, curr) => {
      const isBillPaid = billRules.isBillPaid(curr.transactionDate);

      if (isBillPaid) {
        acc["Paid Bills"].amount += curr.amount;
      } else {
        acc["Total Upcoming"].amount += curr.amount;
      }

      return acc;
    },
    {
      ["Paid Bills"]: {
        amount: 0,
      },
      ["Total Upcoming"]: {
        amount: 0,
      },
    } as DashboardBillSummary,
  );
  const billSummaryList = Object.entries(billSummaryMap) as KeyValueTuple<
    typeof billSummaryMap
  >[];

  return (
    <div className={styles.layout}>
      <div className={styles["header"]}>
        <h2>Recurring Bills</h2>
        <Link {...appLinkOptions.getBillsOptions()} className={styles.link}>
          See Details
          <CaretRight />
        </Link>
      </div>
      <ul className={styles["list"]}>
        {billSummaryList.map(([key, value]) => (
          <li className={styles["list-item"]} key={key}>
            <span className={styles["key"]}>{key}</span>
            <span className={styles["amount"]}>
              {numberFormatter.formatNumber({
                number: value.amount,
                options: numberFormatter.getDollarOptions(),
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
