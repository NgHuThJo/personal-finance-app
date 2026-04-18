import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import styles from "./bills-summary.module.css";
import { CaretRight } from "#frontend/assets/icons/icons";
import { billRules } from "#frontend/features/bills/rules/bill-rules";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllRecurringBillsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { appLinkOptions } from "#frontend/shared/router/options/linkOptions";
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

  let totalPaidBills = 0;
  let totalUpcoming = 0;

  for (const bill of transactionData) {
    const isBillPaid = billRules.isBillPaid(bill.transactionDate);

    if (isBillPaid) {
      totalPaidBills += bill.amount;
    } else {
      totalUpcoming += bill.amount;
    }
  }

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
        <li className={styles["list-item"]}>
          <span className={styles["paid-bills"]}></span>
          <span className={styles["key"]}>Paid Bills</span>
          <span className={styles["amount"]}>
            {numberFormatter.formatNumber({
              number: totalPaidBills,
              options: numberFormatter.getDollarOptions(),
            })}
          </span>
        </li>
        <li className={styles["list-item"]}>
          <span className={styles["upcoming"]}></span>
          <span className={styles["key"]}>Upcoming</span>
          <span className={styles["amount"]}>
            {numberFormatter.formatNumber({
              number: totalUpcoming,
              options: numberFormatter.getDollarOptions(),
            })}
          </span>
        </li>
      </ul>
    </div>
  );
}
