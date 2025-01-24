import { ComponentPropsWithRef, forwardRef } from "react";
import styles from "./dialog.module.css";

type DialogProps = ComponentPropsWithRef<"dialog">;

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ children, className = "default", ...props }, ref) => (
    <dialog className={styles[className]} ref={ref} {...props}>
      {children}
    </dialog>
  ),
);
Dialog.displayName = "Dialog";
