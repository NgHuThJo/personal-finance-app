import { z } from "zod";
import { publicProcedure, router } from "./trpc.js";
import { userService } from "#backend/services/user.js";
import { logError } from "#backend/utils/error-logger.js";
import { emailSchema, nameSchema, passwordSchema } from "#backend/types/zod.js";

export const userRouter = router({
  registerUser: publicProcedure
    .input(
      z.object({
        email: emailSchema,
        firstName: nameSchema,
        lastName: nameSchema,
        password: passwordSchema,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const newUser = await userService.registerUser(input);

        return newUser;
      } catch (error) {
        logError(error);
      }
    }),
});
