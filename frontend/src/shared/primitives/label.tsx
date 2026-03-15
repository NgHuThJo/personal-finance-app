import { Label as LabelPrimitive } from "radix-ui";
import * as React from "react";
import styles from "./Label.module.css";
import { cn } from "#frontend/shared/utils/cn";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(styles.label, className)}
      {...props}
    />
  );
}

export { Label };
