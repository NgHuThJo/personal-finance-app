import { Category } from "@prisma/client";

export type TransactionFilter = Category | "ALL";

export function filterTransactions<T extends { category: Category }>(
  data: T[] | undefined,
  filter: TransactionFilter,
) {
  if (!data || filter === "ALL") {
    return data;
  }

  return data.filter((item) => item.category === filter);
}
