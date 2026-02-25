import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import styles from "./button.module.css";
import { cn } from "#frontend/shared/utils/cn";

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      default: styles["default-variant"],
      link: styles.link,
      logout: styles.logout,
      login: styles.login,
      icon: styles.icon,
    },
    size: {
      default: styles["default-size"],
      sm: styles.sm,
      lg: styles.lg,
      icon: styles.icon,
    },
    intent: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    intent: "default",
  },
  compoundVariants: [],
});

export function Button({
  className,
  variant,
  size,
  intent,
  type = "button",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      type={type}
      className={cn(buttonVariants({ variant, size, intent, className }))}
      {...props}
    />
  );
}
