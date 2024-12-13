import { z } from "zod";
import { publicProcedure, router } from "#backend/routers/trpc.js";
import { budgetService } from "#backend/services/budget.js";
import { logError } from "#backend/utils/error-logger.js";
import { positiveNumberSchema } from "#backend/types/zod.js";

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
});
