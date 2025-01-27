import { ChangeEvent, useState } from "react";
import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";
import { SearchBar } from "#frontend/components/ui/form/search/search";
import { Select } from "#frontend/components/ui/form/select/select";
import { sortTransactions } from "#frontend/domain/transaction";
import { getFullName } from "#frontend/domain/user";
import { Receipt2 } from "#frontend/components/ui/icon/icon";
import {
  formatDate,
  formatNumber,
} from "#frontend/utils/internationalization/intl";
import { Action } from "#frontend/domain/transaction";
import styles from "./bills.module.css";

const options = [
  {
    value: "Newest",
    text: "Newest",
  },
  {
    value: "Oldest",
    text: "Oldest",
  },
  {
    value: "AtoZ",
    text: "A to Z",
  },
  {
    value: "ZtoA",
    text: "Z to A",
  },
  {
    value: "Highest",
    text: "Highest",
  },
  {
    value: "Lowest",
    text: "Lowest",
  },
];

export function Bills() {
  const userId = useUserId();
  const {
    data: bills,
    isPending,
    error,
  } = trpc.transaction.getAllBills.useQuery({ userId });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Action>("Newest");

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.currentTarget.value;

    setSearch(searchValue);
  };

  const handleFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    const filterValue = event.currentTarget.value as Action;

    setFilter(filterValue);
  };

  const paidBills =
    bills?.reduce((prev, curr) => prev + Number(curr.transactionAmount), 0) ??
    0;
  const upcomingBill = bills?.reduce(
    (total, bill) =>
      new Date(bill.createdAt) > new Date()
        ? total + Number(bill.transactionAmount)
        : total,
    0,
  );

  const filteredData = sortTransactions(bills, filter);

  return (
    <div className={styles.container}>
      <div>
        <h1>Recurring Bills</h1>
      </div>
      <div className={styles.total}>
        <Receipt2 />
        <div>
          <h2>Total bills</h2>
          <span>$40.99</span>
        </div>
      </div>
      <div>
        <div className={styles.summary}>
          <h2>Summary</h2>
          <ul>
            <li>
              <span>Paid bills</span>
              <span>${paidBills?.toFixed(2)}</span>
            </li>
            <li>
              <span>Total Upcoming</span>
              <span>${upcomingBill?.toFixed(2)}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles["table-container"]}>
        <div className={styles.filters}>
          <SearchBar filterFn={handleSearch} placeholder="Search bills" />
          <Select
            options={options}
            name="order"
            placeholder="All Bills"
            onChange={handleFilter}
          ></Select>
        </div>
        {filteredData?.length ? (
          <table>
            <thead>
              <th>Bill Title</th>
              <th>Due Date</th>
              <th>Amount</th>
            </thead>
            <tbody>
              {filteredData?.map((bill) => (
                <tr>
                  <td>{getFullName(bill.recipient)}</td>
                  <td>{formatDate(new Date(bill.createdAt))}</td>
                  <td>
                    $
                    {formatNumber(Number(bill.transactionAmount), {
                      opts: {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bills available.</p>
        )}
      </div>
    </div>
  );
}
