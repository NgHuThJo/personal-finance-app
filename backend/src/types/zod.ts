import { z } from "zod";

export const numericStringSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "String is not numeric");
export const positiveNumberSchema = z
  .number()
  .positive("Number must be positive");
export const nonNegativeNumberSchema = z
  .number()
  .nonnegative("Number must not be negative");
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email address is invalid");
export const nonEmptyStringSchema = z
  .string()
  .trim()
  .min(1, "Textfield must not be empty");
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must have at least one character");
export const stringToNumberSchema = z
  .string()
  .trim()
  .transform((value) => {
    const convertedValue = Number(value);

    if (isNaN(convertedValue)) {
      throw new Error(`${convertedValue} can't be converted to number`);
    }
    if (convertedValue <= 0) {
      throw new Error(`${convertedValue} must be positive number`);
    }

    return convertedValue;
  });
export const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must have at least 8 characters");
export const urlSchema = z.string().trim().url();
