import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import { trpc } from "#frontend/lib/trpc";

export const createTestTRPCandQueryClients = (children: ReactNode) => {
  const trpcClient = trpc.createClient({
    links: [
      httpLink({
        url: import.meta.env.VITE_API_URL,
      }),
    ],
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
