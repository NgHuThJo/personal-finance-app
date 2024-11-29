import { ComponentPropsWithRef, forwardRef } from "react";
import styles from "./dialog.module.css";

type DialogProps = ComponentPropsWithRef<"dialog">;

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ children, className = "default", ...restProps }, ref) => (
    <dialog className={styles[className]} ref={ref} {...restProps}>
      {children}
    </dialog>
  ),
);
Dialog.displayName = "Dialog";
