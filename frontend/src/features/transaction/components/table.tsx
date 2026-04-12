import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./table.module.css";
import { CaretLeft, CaretRight } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import type { Category, TransactionSortKey } from "#frontend/shared/client";
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

type KeyLabelOptions<T> = {
  [K in keyof T]: {
    key: K;
    label: T[K];
  };
}[keyof T];
type SortOptions = KeyLabelOptions<typeof _sortKeyMap>;
type CategoryFilter = Category | "all transactions";

const _sortKeyMap = {
  AmountAsc: "lowest",
  AmountDesc: "highest",
  DateAsc: "oldest",
  DateDesc: "newest",
  NameAsc: "A to Z",
  NameDesc: "Z to A",
} as const;

const sortKeyArray: SortOptions[] = [
  {
    key: "AmountAsc",
    label: "lowest",
  },
  {
    key: "AmountDesc",
    label: "highest",
  },
  {
    key: "DateAsc",
    label: "oldest",
  },
  {
    key: "DateDesc",
    label: "newest",
  },
  {
    key: "NameAsc",
    label: "A to Z",
  },
  {
    key: "NameDesc",
    label: "Z to A",
  },
];

export function TransactionTable() {
  const route = getRouteApi("/_pathless-dashboard-layout/transactions");
  const { page, category, pageSize, sortKey } = route.useSearch();
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(
    category,
  );
  const [currentSortKey, setCurrentSortKey] =
    useState<TransactionSortKey>(sortKey);
  const {
    data: { data: transactionData, transactionCount },
  } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
      credentials: "include",
      query: {
        page,
        pageSize,
        category: currentCategory,
        sortKey: currentSortKey,
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
  const extendedCategories: CategoryFilter[] = [
    "all transactions",
    ...categoryData,
  ];

  const handleCategoryChoice = (category: CategoryFilter) => {
    if (category === "all transactions") {
      setCurrentCategory(undefined);
      return;
    }

    setCurrentCategory(category);
  };

  const handleSortChoice = (key: TransactionSortKey) => {
    setCurrentSortKey(key);
  };

  return (
    <div className={styles["layout"]}>
      <header>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Filter by category</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {extendedCategories.map((category) => (
              <DropdownMenuItem
                onSelect={() => handleCategoryChoice(category)}
                key={category}
              >
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
            {sortKeyArray.map(({ key, label }) => (
              <DropdownMenuItem
                onSelect={() => handleSortChoice(key)}
                key={key}
              >
                {capitalizeFirstLetter(label)}
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
          {transactionData.length ? (
            transactionData.map(
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
