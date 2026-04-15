import { linkOptions } from "@tanstack/react-router";
import type { Category, TransactionSortKey } from "#frontend/shared/client";

export const appLinkOptions = {
  getTransactionLinkOptions: (search?: {
    page?: number;
    category?: Category;
    pageSize?: number;
    sortKey?: TransactionSortKey;
    searchQuery?: string;
  }) =>
    linkOptions({
      to: "/transactions",
      search: {
        page: search?.page ?? 1,
        category: search?.category,
        pageSize: search?.pageSize ?? 10,
        sortKey: search?.sortKey ?? "DateAsc",
        searchQuery: search?.searchQuery ?? "",
      },
    }),
  getBillsOptions: (search?: {
    page?: number;
    pageSize?: number;
    sortKey?: TransactionSortKey;
    searchQuery?: string;
  }) =>
    linkOptions({
      to: "/bills",
      search: {
        page: search?.page ?? 1,
        pageSize: search?.pageSize ?? 10,
        sortKey: search?.sortKey ?? "DateAsc",
        searchQuery: search?.searchQuery ?? "",
      },
    }),
};
