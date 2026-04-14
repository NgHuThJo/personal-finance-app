import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./summary.module.css";
import { Receipt2 } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllRecurringBillsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import type { KeyValueTuple } from "#frontend/shared/types/miscellaneous";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

type BillSummary = {
  [K in "Paid Bills" | "Total Upcoming"]: {
    amount: number;
    count: number;
  };
};

export function BillsSummary() {
  const {
    data: { data: transactionData },
  } = useSuspenseQuery({
    ...getAllRecurringBillsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });

  const totalBill = transactionData.reduce((acc, curr) => {
    return acc + curr.amount;
  }, 0);
  const billSummaryMap = transactionData.reduce(
    (acc, curr) => {
      const isBillPaid = new Date(curr.transactionDate).getTime() < Date.now();

      if (isBillPaid) {
        acc["Paid Bills"].amount += curr.amount;
        acc["Paid Bills"].count++;
      } else {
        acc["Total Upcoming"].amount += curr.amount;
        acc["Total Upcoming"].count++;
      }

      return acc;
    },
    {
      ["Paid Bills"]: {
        amount: 0,
        count: 0,
      },
      ["Total Upcoming"]: {
        amount: 0,
        count: 0,
      },
    } as BillSummary,
  );
  const billSummaryList = Object.entries(billSummaryMap) as KeyValueTuple<
    typeof billSummaryMap
  >[];

  return (
    <div className={styles["layout"]}>
      <div className={styles["total-bill-summary"]}>
        <Receipt2 />
        <div className={styles["total-bill-description"]}>
          <span>Total bills</span>
          <span className={styles["total-bill-number"]}>
            {numberFormatter.formatNumber({
              number: totalBill,
              options: numberFormatter.getDollarOptions(),
            })}
          </span>
        </div>
      </div>
      <div className={styles["general-bill-summary"]}>
        <h2>Summary</h2>
        <ul className={styles["general-bill-summary-list"]}>
          {billSummaryList.map(([key, object]) => (
            <li className={styles["general-bill-summary-listitem"]}>
              <span>{key}</span>
              <span
                className={styles["listitem-value"]}
              >{`${object.count} (${numberFormatter.formatNumber({
                number: object.amount,
                options: numberFormatter.getDollarOptions(),
              })})`}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
