import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { BudgetBoard } from "#frontend/features/budget/components/board";
import { Loader } from "#frontend/shared/primitives/loader";

export const Route = createFileRoute("/_pathless-dashboard-layout/budget")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense fallback={<Loader />}>
      <BudgetBoard />
    </Suspense>
  );
}
