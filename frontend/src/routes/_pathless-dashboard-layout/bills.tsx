import { createFileRoute } from "@tanstack/react-router";
import { BillsBoard } from "#frontend/features/bills/components/board";
import type { TransactionSortKey } from "#frontend/shared/client";

export const Route = createFileRoute("/_pathless-dashboard-layout/bills")({
  validateSearch: (search) => {
    return {
      page: Number(search.page ?? 1),
      pageSize: Number(search.pageSize ?? 10),
      sortKey: (search.sortKey as TransactionSortKey) ?? "DateDesc",
      searchQuery: (search.searchQuery as string) ?? "",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <BillsBoard />;
}
