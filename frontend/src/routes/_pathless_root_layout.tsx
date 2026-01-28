import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Logger } from "#frontend/shared/app/logging";
import { getApiAuthRefreshOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/_pathless_root_layout")({
  loader: async ({ context }) => {
    try {
      const data = await context.queryClient.ensureQueryData({
        ...getApiAuthRefreshOptions(),
      });
      const setAccessToken = accessTokenStore.getState().setAcessToken;
      setAccessToken(data.accessToken);

      Logger.debug(
        "New access token via refresh token created and set in store",
      );
      throw redirect({
        to: "/dashboard",
      });
    } catch (error) {
      Logger.error("Access Token creation with refresh token failed", error);
      throw redirect({
        to: "/login",
      });
    }
  },
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
