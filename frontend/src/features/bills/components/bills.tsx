import { trpc } from "#frontend/lib/trpc";
import { SearchBar } from "#frontend/components/ui/form/search/search";
import { sortTransactions } from "#frontend/domain/transaction";
import { Receipt2 } from "#frontend/components/ui/icon/icon";

export function Bills() {
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
          <SearchBar />
          <label htmlFor="order">
            <select name="order" id="order"></select>
          </label>
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
