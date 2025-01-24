import { z } from "zod";
import { publicProcedure, router } from "#backend/routers/trpc.js";
import { transactionService } from "#backend/services/transaction.js";
import { mapToTransactionDTO } from "#backend/dtos/transaction.js";
import { logError } from "#backend/utils/error-logger.js";
import {
  emailSchema,
  positiveNumberSchema,
  stringToNumberSchema,
} from "#backend/types/zod.js";

export const transactionRouter = router({
  getAllTransactions: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
      }),
    )
    .query(async ({ input }) => {
      try {
        const transactions = await transactionService.getAllTransactions(input);

        return mapToTransactionDTO(transactions);
      } catch (error) {
        logError(error);
      }
    }),
  getAllBills: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
      }),
    )
    .query(async ({ input }) => {
      try {
        const bills = await transactionService.getAllBills(input);

        return bills;
      } catch (error) {
        logError(error);
      }
    }),
  createTransaction: publicProcedure
    .input(
      z.object({
        userId: positiveNumberSchema,
        amount: stringToNumberSchema,
        category: z.string(),
        email: emailSchema,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const transaction = await transactionService.createTransaction(input);

        return transaction;
      } catch (error) {
        logError(error);
      }
    }),
});
