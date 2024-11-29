import { ComponentPropsWithoutRef } from "react";
import { FormError } from "../error/error";
import { FormErrorMessage } from "#frontend/types";
import styles from "./textarea.module.css";

type TextAreaProps = ComponentPropsWithoutRef<"textarea"> & FormErrorMessage;

export function TextArea({
  className = "default",
  error,
  name,
  ...restProps
}: TextAreaProps) {
  return (
    <div className={styles[className]}>
      <textarea id={name} name={name} {...restProps}></textarea>
      {typeof error === "string" ? (
        <FormError message={error} />
      ) : (
        error?.map((message, index) => (
          <FormError message={message} key={index} />
        ))
      )}
    </div>
  );
}
