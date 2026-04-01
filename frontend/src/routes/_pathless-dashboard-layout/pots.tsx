import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { PotsBoard } from "#frontend/features/pots/components/board";
import { Loader } from "#frontend/shared/primitives/loader";

export const Route = createFileRoute("/_pathless-dashboard-layout/pots")({
  component: Pots,
});

function Pots() {
  return (
    <Suspense fallback={<Loader />}>
      <PotsBoard />
    </Suspense>
  );
}
