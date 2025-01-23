import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "#backend/routers/api";

export type TransactionQueryOutput = NonNullable<
  inferRouterOutputs<AppRouter>["transaction"]["getAllTransactions"]
>[number];

export type BudgetQueryOutput = NonNullable<
  inferRouterOutputs<AppRouter>["budget"]["getAllBudgets"]
>[number];

export type PotQueryOutput = NonNullable<
  inferRouterOutputs<AppRouter>["pot"]["getAllPots"]
>[number];
