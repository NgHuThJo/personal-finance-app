import { ComponentPropsWithoutRef } from "react";
import { FormError } from "../error/error";
import { FormErrorMessage } from "#frontend/types";
import styles from "./label.module.css";

type LabelProps = ComponentPropsWithoutRef<"label"> &
  FormErrorMessage & {
    label?: string;
  };

export function Label({
  children,
  className = "default",
  error,
  htmlFor,
  label,
  ...restProps
}: LabelProps) {
  return (
    <label className={styles[className]} htmlFor={htmlFor} {...restProps}>
      {label}
      {children}
      {typeof error === "string" ? (
        <FormError message={error} />
      ) : (
        error?.map((message) => <FormError message={message} />)
      )}
    </label>
  );
}
