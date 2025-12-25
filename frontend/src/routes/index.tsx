import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/login",
      replace: true,
    });
  },
  component: Index,
});

function Index() {
  return <div>Redirect to login.</div>;
}
