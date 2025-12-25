import { createFileRoute } from "@tanstack/react-router";
import { PotBoard } from "#frontend/features/pots/components/board";
import { PotsHeader } from "#frontend/features/pots/components/header";
import { getApiPotsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";

export const Route = createFileRoute("/_pathless-dashboard-layout/pots")({
  component: Pots,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      getApiPotsOptions({
        // body:
      }),
    );
  },
});

function Pots() {
  return (
    <>
      <PotsHeader />
      <PotBoard />
    </>
  );
}
