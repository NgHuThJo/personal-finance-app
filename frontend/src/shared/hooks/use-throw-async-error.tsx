import { useState } from "react";

export function useThrowAsyncError() {
  const [, setState] = useState();

  /* This function throws an error during the React lifecycle
  and will be caught by the closest error boundary */
  const throwAsyncError = (error: unknown) => {
    setState(() => {
      throw error;
    });
  };

  return { throwAsyncError };
}
