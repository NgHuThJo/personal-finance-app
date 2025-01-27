import { z } from "zod";
import { publicProcedure, router } from "#backend/routers/trpc.js";
import { potService } from "#backend/services/pot.js";
import { logError } from "#backend/utils/error-logger.js";
import {
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  positiveNumberSchema,
} from "#backend/types/zod.js";

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
  deletePot: publicProcedure
    .input(
      z.object({
        id: positiveNumberSchema,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const deletedPot = await potService.deletePot(input);

        return deletedPot;
      } catch (error) {
        logError(error);
      }
    }),
  createPot: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
        name: nonEmptyStringSchema,
        totalAmount: positiveNumberSchema,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const newPot = await potService.createPot(input);

        return newPot;
      } catch (error) {
        logError(error);
      }
    }),
  updatePot: publicProcedure
    .input(
      z.object({
        id: positiveNumberSchema,
        savedAmount: nonNegativeNumberSchema,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const updatedPot = await potService.updatePot(input);

        return updatedPot;
      } catch (error) {
        logError(error);
      }
    }),
});
