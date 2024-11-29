import { useCallback, useEffect, useRef, useState } from "react";
import { handleError } from "#frontend/utils/error-handling";

type FetchErrorType = ReturnType<typeof handleError>;
type FetchOptionsType = {
  delay?: number;
  retries?: number;
};

export function useFetch({ delay = 500, retries = 3 }: FetchOptionsType = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FetchErrorType>();
  const abortControllerRef = useRef<AbortController>();

  const fetchData = useCallback(
    async (fetchFn: (controller: AbortController) => Promise<void>) => {
      setIsLoading(true);
      setError(undefined);

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          await fetchFn(abortControllerRef.current);
          break;
        } catch (error) {
          if (attempt < retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, delay * attempt),
            );
          } else {
            setError(handleError(error));
          }
        }
      }

      setIsLoading(false);
    },
    [delay, retries],
  );

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  return { isLoading, error, fetchData };
}
