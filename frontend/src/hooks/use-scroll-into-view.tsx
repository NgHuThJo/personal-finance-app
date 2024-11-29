import { useCallback, useRef } from "react";

export function useScrollIntoView<T extends HTMLElement>(
  args?: boolean | ScrollIntoViewOptions,
) {
  const scrollRef = useRef<T>(null);

  const scrollIntoView = useCallback(() => {
    scrollRef.current?.scrollIntoView(args);
  }, [args]);

  return { scrollRef, scrollIntoView };
}
