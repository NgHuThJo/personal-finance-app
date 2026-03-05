import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { PotsBoard } from "#frontend/features/pots/components/board";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getApiPotsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";

export const Route = createFileRoute("/_pathless-dashboard-layout/pots")({
  component: Pots,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      ...getApiPotsOptions({
        client: clientWithAuth,
      }),
    });
  },
});

function Pots() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PotsBoard />
    </Suspense>
  );
}
