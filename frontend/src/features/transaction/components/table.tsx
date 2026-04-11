import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./table.module.css";
import { CaretLeft, CaretRight } from "#frontend/assets/icons/icons";
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
import { sortHelper } from "#frontend/shared/utils/sort";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

type DateSort = "oldest" | "newest";
type StringSort = "A to Z" | "Z to A";
type NumberSort = "lowest" | "highest";
type SortKey = keyof typeof sortMap;

const sortKeys: SortKey[] = [
  "oldest",
  "newest",
  "A to Z",
  "Z to A",
  "lowest",
  "highest",
];

const sortMap: {
  [K in DateSort]: (a: Date, b: Date) => number;
} & {
  [K in StringSort]: (a: string, b: string) => number;
} & {
  [K in NumberSort]: (a: number, b: number) => number;
} = {
  oldest: sortHelper.compareOldest,
  newest: sortHelper.compareNewest,
  ["A to Z"]: sortHelper.compareAToZ,
  ["Z to A"]: sortHelper.compareZToA,
  highest: sortHelper.compareHighest,
  lowest: sortHelper.compareLowest,
};

export function TransactionTable() {
  const route = getRouteApi("/_pathless-dashboard-layout/transactions");
  const { page, category: initialCategory, pageSize } = route.useSearch();
  const [category, setCategory] = useState<Category | "all transactions">(
    initialCategory,
  );
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const {
    data: { data: transactionData, transactionCount },
  } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
      credentials: "include",
      query: {
        page,
        pageSize,
      },
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

  const pageCount = Math.ceil(transactionCount / pageSize);
  const userId = Number(decodeJwt(accessToken?.accessToken as string).sub);
  const filteredTransactions = (
    category === "all transactions"
      ? transactionData
      : transactionData.filter((t) => t.category === category)
  ).sort((t1, t2) => {
    switch (sortKey) {
      case "newest":
      case "oldest": {
        return sortMap[sortKey](
          new Date(t1.transactionDate),
          new Date(t2.transactionDate),
        );
      }
      case "A to Z":
      case "Z to A": {
        return sortMap[sortKey](t1.otherUser.name, t2.otherUser.name);
      }
      case "lowest":
      case "highest": {
        return sortMap[sortKey](t1.amount, t2.amount);
      }
      default: {
        throw new Error(
          `An unknown error occurred in ${TransactionTable.name}`,
        );
      }
    }
  });
  const enhancedCategories = ["All Transactions", ...categoryData];

  const handleCategoryChoice = (e: Event) => {
    const eventTarget = e.target as HTMLDivElement;
    const value = eventTarget.textContent.toLowerCase() as
      | Category
      | "all transactions";
    setCategory(value);
  };

  const handleSortChoice = (e: Event) => {
    const eventTarget = e.target as HTMLDivElement;
    const value = eventTarget.textContent.toLowerCase() as SortKey;
    setSortKey(value);
  };

  return (
    <div className={styles["layout"]}>
      <header>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Filter by category</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {enhancedCategories.map((category) => (
              <DropdownMenuItem onSelect={handleCategoryChoice} key={category}>
                {capitalizeFirstLetter(category)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Sort</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {sortKeys.map((key) => (
              <DropdownMenuItem onSelect={handleSortChoice} key={key}>
                {capitalizeFirstLetter(key)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
                id,
                amount,
                category,
                transactionDate,
                otherUser: { name },
                senderId,
              }) => (
                <tr key={id}>
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
      <div className={styles["pagination-layout"]}>
        <Link
          from="/transactions"
          to="."
          search={(prev) => ({ ...prev, page: page - 1 })}
          disabled={page === 1}
          className={styles["next-back-link"]}
        >
          <CaretLeft />
          Back
        </Link>
        <div className={styles["pagination-button-layout"]}>
          {Array.from({ length: pageCount }).map((_, index) => (
            <Link
              from="/transactions"
              to="."
              className={styles["link"]}
              search={(prev) => ({ ...prev, page: index + 1 })}
              activeProps={{
                className: styles["active-link"],
              }}
              key={index}
            >
              {index + 1}
            </Link>
          ))}
        </div>
        <Link
          from="/transactions"
          to="."
          search={(prev) => ({ ...prev, page: page + 1 })}
          disabled={page === pageCount}
          className={styles["next-back-link"]}
        >
          Next
          <CaretRight />
        </Link>
      </div>
    </div>
  );
}
