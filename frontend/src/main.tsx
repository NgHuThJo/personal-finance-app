import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Context } from "./providers/context";
import { Router } from "./app/router";
import { trpc, trpcClient } from "#frontend/lib/trpc";
import "#frontend/assets/styles";

const root = document.getElementById("root");
const queryClient = new QueryClient();

if (!root) {
  throw new ReferenceError("DOM root not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Context>
          <Router />
        </Context>
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
);
