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
  ...props
}: LabelProps) {
  return (
    <label className={styles[className]} htmlFor={htmlFor} {...props}>
      {label}
      {children}
      {typeof error === "string" ? (
        <FormError message={error} />
      ) : (
        error?.map((message, index) => (
          <FormError key={index} message={message} />
        ))
      )}
    </label>
  );
}
