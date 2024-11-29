import { z } from "zod";

type ValidationSuccess<T extends z.ZodSchema> = {
  isValid: true;
  data: z.infer<T>;
  errors: undefined;
};

type ValidationFailure<T extends z.ZodSchema> = {
  isValid: false;
  data: undefined;
  errors: {
    fieldErrors: z.inferFlattenedErrors<T>["fieldErrors"];
  };
};

export function validateInput<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
): ValidationSuccess<T> | ValidationFailure<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      isValid: false,
      data: undefined,
      errors: {
        fieldErrors: result.error.flatten().fieldErrors,
      },
    };
  }

  return {
    isValid: true,
    data: result.data as z.infer<T>,
    errors: undefined,
  };
}

export function isNumeric(string: string) {
  return /^\d+$/.test(string);
}

export function isValidUUID(string: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    string,
  );
}
