import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathless-root-layout/")({
  component: Index,
});

function Index() {
  return <Navigate to="/login" />;
}
