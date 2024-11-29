import { Context, useContext } from "react";

export function useContextWrapper<T>(
  context: Context<T>,
  errorMessage: string,
) {
  const currentContext = useContext(context);

  if (!currentContext) {
    throw new Error(errorMessage);
  }

  return currentContext;
}
