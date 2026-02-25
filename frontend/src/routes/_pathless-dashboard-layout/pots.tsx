import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { PotsBoard } from "#frontend/features/pots/components/board";

export const Route = createFileRoute("/_pathless-dashboard-layout/pots")({
  component: Pots,
  loader: async ({ context }) => {
    // await context.queryClient.ensureQueryData(
    // );
  },
});

function Pots() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PotsBoard />
    </Suspense>
  );
}
