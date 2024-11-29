import { useEffect, useMemo, useRef } from "react";

type DebouncedFunction<T extends (...args: any[]) => void> = {
  (...args: Parameters<T>): void;
  clear: () => void;
};

function debounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedCallback: DebouncedFunction<T> = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = null;
    }, delay);
  };

  debouncedCallback.clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedCallback;
}

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay = 1000,
): DebouncedFunction<T> {
  const ref = useRef<T>(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = (...args: Parameters<T>) => {
      ref.current(...args);
    };

    return debounce(func, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      debouncedCallback.clear();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
}
