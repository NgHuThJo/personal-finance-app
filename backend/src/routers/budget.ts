import { z } from "zod";
import { publicProcedure, router } from "#backend/routers/trpc.js";
import { budgetService } from "#backend/services/budget.js";
import { logError } from "#backend/utils/error-logger.js";
import {
  positiveNumberSchema,
  stringToNumberSchema,
} from "#backend/types/zod.js";

export const budgetRouter = router({
  getAllBudgets: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
      }),
    )
    .query(async ({ input }) => {
      try {
        const budgets = await budgetService.getAllBudgets(input);

        return budgets;
      } catch (error) {
        logError(error);
      }
    }),
  createBudget: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
        category: z.string(),
        amount: stringToNumberSchema,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const budgets = await budgetService.createBudget(input);

        return budgets;
      } catch (error) {
        logError(error);
      }
    }),
  deleteBudget: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
        category: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const deletedBudget = await budgetService.deleteBudget(input);

        return deletedBudget;
      } catch (error) {
        logError(error);
      }
    }),
});
