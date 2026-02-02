import { createFileRoute } from "@tanstack/react-router";
import { Signup } from "#frontend/features/auth/components/signup";

export const Route = createFileRoute("/_pathless-auth-layout/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Signup />;
}
