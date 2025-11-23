import { useEffect, useState } from "react";
import type { Primitive } from "#frontend/shared/types/miscellaneous";

export function useDebouncedValue<T extends Primitive>(value: T, delay = 1000) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
  }, [value, delay]);

  return debouncedValue;
}
