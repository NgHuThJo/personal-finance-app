import { Label as LabelPrimitive } from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import styles from "./label.module.css";
import { cn } from "#frontend/shared/utils/cn";

const labelVariants = cva(styles.label, {
  variants: {
    variant: {
      default: styles["default-label"],
    },
  },
  defaultVariants: {
    // variant: "default",
  },
  compoundVariants: [],
});

export function Label({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof LabelPrimitive> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive
      data-slot="label"
      className={cn(labelVariants({ variant, className }))}
      {...props}
    />
  );
}
