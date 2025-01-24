import { ComponentPropsWithRef } from "react";
import styles from "./button.module.css";

type ButtonProps = ComponentPropsWithRef<"button">;

export function Button({
  children,
  className = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button className={styles[className]} type={type} {...props}>
      {children}
    </button>
  );
}
