import { createFileRoute } from "@tanstack/react-router";
import { Login } from "#frontend/features/auth/components/login";

export const Route = createFileRoute("/_pathless-auth-layout/login")({
  component: LoginRoute,
});

function LoginRoute() {
  return <Login />;
}
