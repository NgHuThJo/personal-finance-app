import { ZodError } from "zod";

export function makeZodErrorsUserFriendly<T>(error: ZodError<T>) {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.entries(fieldErrors).reduce(
    (acc, [key, messages]) => {
      if (Array.isArray(messages)) {
        acc[key as keyof T] = messages.filter((_, index) => index % 2 === 0);
      }

      return acc;
    },
    {} as Record<keyof T, string[]>,
  );
}
