import { router } from "./trpc.js";
import { accountRouter } from "#backend/routers/account.js";
import { authRouter } from "./auth.js";
import { potRouter } from "#backend/routers/pot.js";
import { userRouter } from "./user.js";

export const appRouter = router({
  account: accountRouter,
  auth: authRouter,
  pot: potRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
