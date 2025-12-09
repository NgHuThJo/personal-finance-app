import { createFileRoute } from "@tanstack/react-router";
import { PotBoard } from "#frontend/features/pots/components/board";
import { PotsHeader } from "#frontend/features/pots/components/header";

export const Route = createFileRoute("/_pathless-layout/pots")({
  component: Pots,
});

function Pots() {
  return (
    <>
      <PotsHeader />
      <PotBoard />
    </>
  );
}
