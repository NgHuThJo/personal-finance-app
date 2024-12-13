import { router } from "./trpc.js";
import { accountRouter } from "#backend/routers/account.js";
import { authRouter } from "./auth.js";
import { budgetRouter } from "#backend/routers/budget.js";
import { potRouter } from "#backend/routers/pot.js";
import { transactionRouter } from "#backend/routers/transaction.js";
import { userRouter } from "./user.js";

export const appRouter = router({
  account: accountRouter,
  auth: authRouter,
  budget: budgetRouter,
  pot: potRouter,
  transaction: transactionRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
