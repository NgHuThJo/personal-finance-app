import { linkOptions } from "@tanstack/react-router";

export const appLinkOptions = {
  getTransactionLinkOptions: () =>
    linkOptions({
      to: "/transactions",
      search: {
        page: 1,
        category: undefined,
        pageSize: 10,
        sortKey: "DateAsc",
        searchQuery: "",
      },
    }),
  getBillsOptions: () =>
    linkOptions({
      to: "/bills",
      search: {
        page: 1,
        pageSize: 10,
        sortKey: "DateAsc",
        searchQuery: "",
      },
    }),
};
