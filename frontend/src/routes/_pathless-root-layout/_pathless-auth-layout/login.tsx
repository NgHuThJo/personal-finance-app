import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "#frontend/features/auth/components/login";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createFileRoute(
  "/_pathless-root-layout/_pathless-auth-layout/login",
)({
  beforeLoad: () => {
    const accessToken = accessTokenStore.getState().accessToken;

    if (accessToken) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: LoginRoute,
});

function LoginRoute() {
  return <Login />;
}
