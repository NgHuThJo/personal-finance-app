import { z } from "zod";

// Utility schemas
export const numericStringSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "String is not numeric");
export const stringToNumberSchema = numericStringSchema.transform((value) =>
  Number(value),
);
export const numberToStringSchema = z
  .number()
  .transform((value) => String(value));
export const nonEmptyStringSchema = z.string().trim().min(1, "Field is empty");
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email address is invalid");
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must have at least one character");
export const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must have at least 8 characters");
export const positiveNumberSchema = z
  .number()
  .positive("Number must be positive");
export const fileSchema = z.object({
  name: z.string().min(1, "File name is required"),
  size: z.number().max(10 * 1024 * 1024, "File size must be less than 10MB"),
  type: z.string().regex(/^image\/(jpeg|jpg|png)$/, "Invalid file type"),
  lastModified: z.number(),
  lastModifiedDate: z.date(),
});
export const paginationSchema = z.object({
  page: z.number().positive("Page must be positive number"),
  limit: z.number().positive("Limit must be positive number"),
});
export const cursorSchema = z.object({
  cursors: z.object({
    next: z.number().positive().nullable(),
    back: z.number().positive().nullable(),
  }),
});
export const infiniteScrollSchema = z.object({
  cursor: z
    .object({
      id: z.number().positive("Id must be positive number"),
      hasMore: z.boolean(),
    })
    .nullable(),
  limit: z.number().positive("Limit must be positive number"),
});

// Schemas and error types for React Router actions and event handlers
export type SchemaError<T extends z.ZodSchema> =
  z.inferFlattenedErrors<T>["fieldErrors"];

// Base schemas
export const userIdSchema = z.object({
  userId: numericStringSchema,
});

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type AuthSchemaError = SchemaError<typeof authSchema>;

// Extended schemas
export const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailSchema,
  password: passwordSchema,
});

export type RegistrationSchemaError = SchemaError<typeof registrationSchema>;

export const transactionFormSchema = z.object({
  userId: positiveNumberSchema,
  email: emailSchema,
  category: z.enum(["BILLS", "GROCERIES", "TRANSPORTATION", "ENTERTAINMENT"]),
  amount: numericStringSchema,
});

export type TransactionFormSchemaError = SchemaError<
  typeof transactionFormSchema
>;

export const budgetFormSchema = z.object({
  userId: positiveNumberSchema,
  category: z.enum(["BILLS", "GROCERIES", "TRANSPORTATION", "ENTERTAINMENT"]),
  amount: numericStringSchema,
});
export type BudgetFormSchemaError = SchemaError<typeof transactionFormSchema>;

export const potFormSchema = z.object({
  userId: positiveNumberSchema,
  name: nonEmptyStringSchema,
  totalAmount: stringToNumberSchema,
});
export type PotFormSchemaError = SchemaError<typeof potFormSchema>;
