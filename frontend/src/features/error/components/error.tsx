import { type ErrorComponentProps } from "@tanstack/react-router";
import styles from "./error.module.css";
import type { ProblemDetails } from "#frontend/shared/client";
import { Button } from "#frontend/shared/primitives/button";

export function ErrorBoundary({ error, info, reset }: ErrorComponentProps) {
  return (
    <div className={styles.layout}>
      <p
        className={styles["error-message"]}
      >{`Error message: ${error.message ?? (error as ProblemDetails).detail}
      Error info: ${info}`}</p>
      <Button size="lg" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
