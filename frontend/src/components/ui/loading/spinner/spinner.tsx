import { ComponentPropsWithRef } from "react";
import styles from "./spinner.module.css";

type SpinnerProps = ComponentPropsWithRef<"div">;

export function LoadingSpinner({
  className = "default",
  ...restProps
}: SpinnerProps) {
  return <div className={styles[className]} {...restProps}></div>;
}
