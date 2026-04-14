import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import styles from "./Checkbox.module.css";
import { CheckIcon } from "#frontend/assets/icons/icons";

function Checkbox({
  className = "",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={[styles.checkbox, styles[className]].join(" ")}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={styles.indicator}
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
