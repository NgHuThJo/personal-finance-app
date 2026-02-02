import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Logger } from "#frontend/shared/app/logging";
import { getApiAuthRefreshOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    loader: async ({ context, location }) => {
      try {
        const { accessToken, setAccessToken } = accessTokenStore.getState();

        if (accessToken) {
          throw Route.redirect({
            to: "./dashboard",
            replace: true,
          });
        }

        const data = await context.queryClient.ensureQueryData({
          ...getApiAuthRefreshOptions({
            credentials: "include",
          }),
        });
        setAccessToken(data.accessToken);

        Logger.info(
          "New access token via refresh token created and set in store",
        );
      } catch (error) {
        Logger.error("Access token creation with refresh token failed", error);
        if (location.pathname === "/") {
          throw Route.redirect({
            to: "./login",
          });
        }
      }
    },
    component: Root,
  },
);

function Root() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
