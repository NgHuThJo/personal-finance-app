import { z } from "zod";
import { publicProcedure, router } from "#backend/routers/trpc.js";
import { transactionService } from "#backend/services/transaction.js";
import { logError } from "#backend/utils/error-logger.js";
import { positiveNumberSchema } from "#backend/types/zod.js";

export const transactionRouter = router({
  getBalance: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
      }),
    )
    .query(async ({ input }) => {
      try {
        const transactions = await transactionService.getAllTransactions(input);

        return transactions;
      } catch (error) {
        logError(error);
      }
    }),
});
