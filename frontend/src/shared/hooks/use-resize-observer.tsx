import { useEffect, useRef } from "react";

export function useResizeObserver(callback: ResizeObserverCallback) {
  const observerRef = useRef<ResizeObserver | null>(null);
  const observedElements = useRef<Set<Element>>(new Set());

  const observeElement = (element: Element | null) => {
    if (element && !observedElements.current.has(element)) {
      observerRef.current?.observe(element);
      observedElements.current.add(element);
    }
  };

  const unobserveElement = (element: Element | null) => {
    if (element && observedElements.current.has(element)) {
      observerRef.current?.unobserve(element);
      observedElements.current.delete(element);
    }
  };

  const observeChildNodes = (element: Element | null) => {
    if (element) {
      for (const childNode of element.children) {
        observeElement(childNode);
      }
    }
  };

  useEffect(() => {
    observerRef.current = new ResizeObserver(callback);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      observedElements.current.clear();
    };
  }, [callback]);

  return { observeElement, unobserveElement, observeChildNodes };
}
