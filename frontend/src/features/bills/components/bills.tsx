import { ChangeEvent, useState } from "react";
import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";
import { SearchBar } from "#frontend/components/ui/form/search/search";
import { Select } from "#frontend/components/ui/form/select/select";
import { sortTransactions } from "#frontend/domain/transaction";
import { Receipt2 } from "#frontend/components/ui/icon/icon";
import { Actions } from "#frontend/domain/transaction";

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
  const [filter, setFilter] = useState<Actions>("Newest");

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

  const filteredData = sortTransactions(bills, search);

  return (
    <div>
      <div>
        <h1>Recurring Bills</h1>
      </div>
      <div>
        <div>
          <Receipt2 />
          <h2>Total bills</h2>
          <span>$40.99</span>
        </div>
        <div>
          <h2>Summary</h2>
          <ul>
            <li>
              <span>Paid bills</span>
              <span>$</span>
            </li>
            <li>
              <span>Total Upcoming</span>
              <span>$</span>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <div>
          <SearchBar filterFn={handleSearch} />
          <Select
            options={options}
            name="order"
            placeholder="All Bills"
          ></Select>
        </div>
        <table>
          <thead>
            <th>Bill Title</th>
            <th>Due Date</th>
            <th>Amount</th>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  );
}
