import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useIntersectionObserver } from "./use-intersection-observer";
import { useFetch } from "./use-fetch";

type InfiniteScrollCursor = {
  id: number;
  hasMore: boolean;
} | null;

export function useInfiniteScroll(
  fetchFn: (
    payload: any,
    controller: AbortController,
    setCursor: Dispatch<SetStateAction<InfiniteScrollCursor>>,
  ) => Promise<void>,
  payloadData?: any,
  currentCursor?: InfiniteScrollCursor,
  pageLimit = 5,
) {
  const lastItemRef = useRef<Element>();
  const [cursor, setCursor] = useState<InfiniteScrollCursor>(() => {
    return currentCursor ?? null;
  });
  const { observeElement, unobserveElement } = useIntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (cursor?.hasMore && entry.isIntersecting) {
          console.log("Execute intersection observer");
          fetchNextBatch();
        }
      });
    },
  );
  const { isLoading, error, fetchData } = useFetch();

  const fetchNextBatch = () => {
    fetchData(async (controller) => {
      const payload = {
        ...payloadData,
        cursor,
        limit: pageLimit,
      };
      await fetchFn(payload, controller, setCursor);
    });
  };

  const observeLastItem = (node: Element) => {
    if (isLoading) {
      return;
    }

    if (lastItemRef.current) {
      unobserveElement(lastItemRef.current);
      lastItemRef.current = undefined;
    }

    if (cursor?.hasMore) {
      lastItemRef.current = node;
      observeElement(node);
    }
  };

  return { isLoading, error, fetchData, cursor, observeLastItem };
}
