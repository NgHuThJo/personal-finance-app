import { useRef } from "react";

export function useLatest<T>(object: {
  [K in keyof T]: T[K];
}) {
  const ref = useRef<T>(object);
  ref.current = object;

  return ref;
}
