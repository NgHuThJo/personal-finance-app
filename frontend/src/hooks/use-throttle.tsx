import { useEffect, useMemo, useRef } from "react";

type ThrottledFunction<T extends (...args: any[]) => void> = {
  (...args: Parameters<T>): void;
  clear: () => void;
};

export function throttle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
): ThrottledFunction<T> {
  let isThrottling = false;
  let lastArgs: Parameters<T> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutFunc = () => {
    if (lastArgs === null) {
      isThrottling = false;
    } else {
      callback(...lastArgs);
      lastArgs = null;
      timeoutId = setTimeout(timeoutFunc, delay);
    }
  };

  const throttledCallback = (...args: Parameters<T>) => {
    if (isThrottling) {
      lastArgs = args;
      return;
    }

    callback(...args);
    isThrottling = true;
    timeoutId = setTimeout(timeoutFunc, delay);
  };

  throttledCallback.clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isThrottling = false;
    lastArgs = null;
  };

  return throttledCallback;
}

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay = 1000,
): ThrottledFunction<T> {
  const ref = useRef<T>(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const throttledCallback = useMemo(() => {
    const func = (...args: Parameters<T>) => {
      ref.current(...args);
    };

    return throttle(func, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      throttledCallback.clear();
    };
  }, [throttledCallback]);

  return throttledCallback;
}
