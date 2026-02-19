import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { z } from "zod";
import { routeTree } from "#frontend/routeTree.gen";
import { ErrorBoundary } from "#frontend/shared/app/error-boundary";
import { Logger } from "#frontend/shared/app/logging";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";
import "#frontend/assets/styles";

// Added for customizing test behavior
const defaultQueryRetries = import.meta.env.VITE_IS_E2E === "true" ? 0 : 3;

z.config({
  customError: (issue) => {
    const formattedPath = issue?.path?.map((value) => {
      if (typeof value === "number" || typeof value === "symbol") {
        return `[${String(value)}]`;
      }

      return capitalizeFirstLetter(value);
    });

    // If formattedPath is undefined, return undefined to fall back to the default message
    if (formattedPath === undefined) {
      return undefined;
    }

    if (issue.code === "too_small") {
      return {
        message: `${formattedPath.join("")} is too small, minimum is ${issue.minimum}`,
      };
    }

    if (issue.code === "too_big") {
      return {
        message: `${formattedPath.join("")} is too big, maximum is ${issue.maximum}`,
      };
    }
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
      retry: defaultQueryRetries,
    },
  },
  queryCache: new QueryCache({
    onError(error, query) {
      if (query.state.data !== undefined) {
        Logger.error("Background update failed:", error);
        return;
      }

      Logger.error("Something went wrong:", error);
    },
  }),
});

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) {
  throw new ReferenceError("DOM root not found");
}

ReactDOM.createRoot(root, {}).render(
  <StrictMode>
    <ErrorBoundary fallback={<div>Some error happened.</div>}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
