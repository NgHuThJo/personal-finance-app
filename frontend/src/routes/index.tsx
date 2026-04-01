import { createFileRoute, Navigate, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const currentLocation = useLocation();

  return (
    <Navigate
      to={
        currentLocation.pathname === "/"
          ? "/dashboard"
          : currentLocation.pathname
      }
    />
  );
}
