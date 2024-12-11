import { z } from "zod";
import { publicProcedure, router } from "#backend/routers/trpc.js";
import { potService } from "#backend/services/pot.js";
import { logError } from "#backend/utils/error-logger.js";
import { positiveNumberSchema } from "#backend/types/zod.js";

export const potRouter = router({
  getAllPots: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
      }),
    )
    .query(async ({ input }) => {
      try {
        const pots = await potService.getAllPots(input);

        return pots;
      } catch (error) {
        logError(error);
      }
    }),
});
