import { createFileRoute } from "@tanstack/react-router";
import { TransactionBoard } from "#frontend/features/transaction/components/board";
import type { Category, TransactionSortKey } from "#frontend/shared/client";

export const Route = createFileRoute(
  "/_pathless-dashboard-layout/transactions",
)({
  validateSearch: (search) => {
    return {
      page: Number(search.page ?? 1),
      pageSize: Number(search.pageSize ?? 10),
      sortKey: (search.sortKey as TransactionSortKey) ?? "DateDesc",
      category: search.category as Category | undefined,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <TransactionBoard />;
}
