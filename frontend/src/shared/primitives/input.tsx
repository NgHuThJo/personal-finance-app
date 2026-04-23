import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import styles from "./input.module.css";
import { cn } from "#frontend/shared/utils/cn";

const inputVariants = cva(styles.input, {
  variants: {
    variant: {
      default: styles["default-input"],
      search: styles["search"],
    },
  },
  defaultVariants: {},
  compoundVariants: [],
});

export function Input({
  className,
  type,
  variant,
  ...props
}: ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}
