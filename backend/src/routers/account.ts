import { z } from "zod";
import { publicProcedure, router } from "#backend/routers/trpc.js";
import { accountService } from "#backend/services/account.js";
import { logError } from "#backend/utils/error-logger.js";
import { positiveNumberSchema } from "#backend/types/zod.js";

export const accountRouter = router({
  getBalance: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
      }),
    )
    .query(async ({ input }) => {
      try {
        const balance = await accountService.getBalance(input);

        return balance;
      } catch (error) {
        logError(error);
      }
    }),
});
