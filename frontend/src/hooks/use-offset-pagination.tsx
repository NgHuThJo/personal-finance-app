import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { useFetch } from "./use-fetch";

type PageData = {
  page: number;
  totalPages: number;
};

export function useOffsetPagination(
  pageTransitionFn: (
    payload: any,
    controller: AbortController,
    setPageData: Dispatch<SetStateAction<PageData>>,
  ) => Promise<void>,
  payloadData: any,
  totalPages = 2,
  pageLimit = 5,
) {
  const [pageData, setPageData] = useState<PageData>(() => ({
    page: 1,
    totalPages: totalPages,
  }));
  const { error, isLoading, fetchData } = useFetch();

  const goToNextPage = () => {
    const nextPage = pageData.page + 1;

    if (nextPage > pageData.totalPages) {
      return;
    }

    fetchData(async (controller) => {
      const payload = {
        ...payloadData,
        page: nextPage,
        limit: pageLimit,
      };
      await pageTransitionFn(payload, controller, setPageData);
    });
  };

  const goToPreviousPage = () => {
    const previousPage = pageData.page - 1;

    if (previousPage < 1) {
      return;
    }

    fetchData(async (controller) => {
      const payload = {
        ...payloadData,
        page: previousPage,
        limit: pageLimit,
      };
      await pageTransitionFn(payload, controller, setPageData);
    });
  };

  const goToSpecificPage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPage = Number(Object.fromEntries(formData).page);

    if (
      currentPage < 1 ||
      currentPage > pageData.totalPages ||
      currentPage === pageData.page
    ) {
      return;
    }

    fetchData(async (controller) => {
      const payload = {
        ...payloadData,
        page: currentPage,
        limit: pageLimit,
      };
      await pageTransitionFn(payload, controller, setPageData);
    });
  };

  return {
    isLoading,
    error,
    pageData,
    fetchData,
    goToNextPage,
    goToPreviousPage,
    goToSpecificPage,
  };
}
