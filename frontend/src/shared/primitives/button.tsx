import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import styles from "./button.module.css";
import { cn } from "#frontend/shared/utils/cn";

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      default: styles.default,
      ghost: styles.ghost,
      link: styles.link,
      cancel: styles.cancel,
      select: styles.select,
      sidebar: styles.sidebar,
      unit: styles.unit,
      search: styles.search,
      dropdown: styles.dropdown,
      bookmark: styles.bookmark,
      retry: styles.retry,
      logout: styles.logout,
      login: styles.login,
      ["search-item"]: styles["search-item"],
    },
    size: {
      default: styles["default-size"],
      sm: styles.sm,
      lg: styles.lg,
      icon: styles.icon,
      select: styles["select-size"],
      sidebar: styles["sidebar-size"],
      board: styles["board-size"],
    },
    intent: {
      default: "",
      destructive: "",
      create: "",
      active: "",
      unit: "",
      weekday: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    intent: "default",
  },
  compoundVariants: [
    {
      variant: "dropdown",
      intent: "unit",
      className: styles["unit"],
    },
    {
      variant: "dropdown",
      intent: "weekday",
      className: styles["weekday"],
    },
    {
      variant: "default",
      intent: "destructive",
      className: styles["destructive-default"],
    },
    {
      variant: "link",
      intent: "destructive",
      className: styles["destructive-link"],
    },
    {
      variant: "sidebar",
      intent: "create",
      className: styles["create-sidebar"],
    },
    {
      variant: "sidebar",
      intent: "active",
      className: styles["active-sidebar"],
    },
  ],
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
