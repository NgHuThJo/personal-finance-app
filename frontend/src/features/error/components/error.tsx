import { type ErrorComponentProps } from "@tanstack/react-router";

export function ErrorBoundary({ error, info, reset }: ErrorComponentProps) {
  return <p>{error.message}</p>;
}
