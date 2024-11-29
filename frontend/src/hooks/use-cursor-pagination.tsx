import { Dispatch, SetStateAction, useState } from "react";
import { useFetch } from "./use-fetch";

type Cursors = {
  nextCursor: number | null;
  backCursor: number | null;
  hasMoreForward: boolean;
  hasMoreBackward: boolean;
};

export function useCursorPagination(
  pageTransitionFn: (
    payload: any,
    controller: AbortController,
    setCursors: Dispatch<SetStateAction<Cursors>>,
  ) => Promise<void>,
  payloadData?: any,
  currentCursors?: Cursors,
  pageLimit = 5,
) {
  const [cursors, setCursors] = useState<Cursors>({
    nextCursor: currentCursors?.nextCursor ?? null,
    backCursor: currentCursors?.backCursor ?? null,
    hasMoreForward: currentCursors?.hasMoreForward ?? true,
    hasMoreBackward: currentCursors?.hasMoreBackward ?? false,
  });
  const { error, isLoading, fetchData } = useFetch();

  const goToNextPage = () => {
    fetchData(async (controller) => {
      const payload = {
        ...payloadData,
        cursors: {
          next: cursors.nextCursor,
          back: cursors.backCursor,
        },
        isForward: true,
        limit: pageLimit,
      };
      await pageTransitionFn(payload, controller, setCursors);
    });
  };

  const goToPreviousPage = () => {
    fetchData(async (controller) => {
      const payload = {
        ...payloadData,
        cursors: {
          next: cursors.nextCursor,
          back: cursors.backCursor,
        },
        isForward: false,
        limit: pageLimit,
      };
      await pageTransitionFn(payload, controller, setCursors);
    });
  };

  return {
    isLoading,
    error,
    cursors,
    fetchData,
    goToNextPage,
    goToPreviousPage,
  };
}
