import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./table.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import type { Category } from "#frontend/shared/client";
import {
  createRefreshTokenOptions,
  getAllCategoriesOptions,
  getAllTransactionsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#frontend/shared/primitives/dropdown";
import { dateTimeFormatter } from "#frontend/shared/utils/intl/datetime-format";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";
import { decodeJwt } from "#frontend/shared/utils/object";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

export function TransactionTable() {
  const route = getRouteApi("/_pathless-dashboard-layout/transactions");
  const { page, category: initialCategory } = route.useSearch();
  const [category, setCategory] = useState<Category | "all transactions">(
    initialCategory,
  );
  const { data } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });
  const { data: categoryData } = useSuspenseQuery({
    ...getAllCategoriesOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });
  const { data: accessToken } = useQuery({
    ...createRefreshTokenOptions(),
    enabled: false,
  });

  const userId = Number(decodeJwt(accessToken?.accessToken as string).sub);
  const filteredTransactions =
    category === "all transactions"
      ? data
      : data.filter((t) => t.category === category);
  const enhancedCategories = ["All Transactions", ...categoryData];

  const handleCategoryChoice = (e: Event) => {
    const eventTarget = e.target as HTMLDivElement;
    const value = eventTarget.textContent.toLowerCase() as
      | Category
      | "all transactions";
    setCategory(value);
  };

  return (
    <div className={styles["layout"]}>
      <header>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Choose a category</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {enhancedCategories.map((category) => (
              <DropdownMenuItem onSelect={handleCategoryChoice}>
                {capitalizeFirstLetter(category)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div></div>
        <div></div>
      </header>
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
          {filteredTransactions.length ? (
            filteredTransactions.map(
              ({
                amount,
                category,
                transactionDate,
                otherUser: { name },
                senderId,
              }) => (
                <tr>
                  <td>{name}</td>
                  <td>{capitalizeFirstLetter(category)}</td>
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
            <td className={styles["no-transaction-found"]} colSpan={4}>
              No transactions found.
            </td>
          )}
        </tbody>
      </table>
      <div className={styles["navigation-button-layout"]}>
        <Button variant="ghost">Back</Button>
        <Button variant="ghost">Next</Button>
      </div>
    </div>
  );
}
