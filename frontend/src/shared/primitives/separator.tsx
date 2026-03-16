import { Separator as SeparatorPrimitive } from "@radix-ui/react-separator";
import type { ComponentProps } from "react";
import styles from "./Separator.module.css";
import { cn } from "#frontend/shared/utils/cn";

export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: ComponentProps<typeof SeparatorPrimitive>) {
  const orientationClass =
    orientation === "vertical" ? styles.vertical : styles.horizontal;

  return (
    <SeparatorPrimitive
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(styles.separator, orientationClass, className)}
      {...props}
    />
  );
}
