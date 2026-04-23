import { clamp } from "#frontend/shared/utils/number";

export function calculatePageCount({
  totalItemCount,
  pageSize,
}: {
  totalItemCount: number;
  pageSize: number;
}) {
  return Math.ceil(totalItemCount / pageSize);
}

export function calculatePaginationWindow({
  pageCount,
  page,
  pageRange = 2,
}: {
  pageCount: number;
  page: number;
  pageRange: number;
}) {
  if (pageRange < 0 || pageCount < 0) {
    throw new Error(
      `Invalid input in ${calculatePaginationWindow.name}, page: ${page}, pageCount: ${pageCount}, pageRange: ${pageRange}`,
    );
  }
  const minimumPage = 1;

  // Clamp page to account for invalid page arguments
  const clampedPage = clamp(page, minimumPage, pageCount);
  let leftPageEdge = clampedPage - pageRange;
  let rightPageEdge = clampedPage + pageRange;
  // Check if pages spill over the left and right edges
  // Balance the page window at the left and right sides if there is some spilling
  if (leftPageEdge < minimumPage) {
    rightPageEdge += minimumPage - leftPageEdge;
  }

  if (rightPageEdge > pageCount) {
    leftPageEdge -= rightPageEdge - pageCount;
  }

  // Clamp both edges to get the final edges
  leftPageEdge = Math.max(minimumPage, leftPageEdge);
  rightPageEdge = Math.min(pageCount, rightPageEdge);

  // Check whether the page window's left edge is at the page's outermost edge
  const isPageEdgeAtStart = leftPageEdge === minimumPage;
  // Same here for the page window's right edge
  const isPageEdgeAtEnd = rightPageEdge === pageCount;

  // Calculate the real window size after adjustments to the edges
  // Add one to account for the inherent zero-based nature of counting, e.g. page 1 to 3 has 3, not 2 pages
  const pageWindowSize = rightPageEdge - leftPageEdge + 1;

  return {
    leftPageEdge,
    rightPageEdge,
    pageWindowSize,
    isPageEdgeAtStart,
    isPageEdgeAtEnd,
  };
}
