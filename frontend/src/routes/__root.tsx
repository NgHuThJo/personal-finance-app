import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect, useEffectEvent } from "react";
import { ToastContainer } from "react-toastify";
import { Logger } from "#frontend/shared/app/logging";
import {
  createRefreshTokenOptions,
  createRefreshTokenQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Loader } from "#frontend/shared/primitives/loader";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: Root,
  },
);

function Root() {
  const { isPending } = useQuery({
    ...createRefreshTokenOptions({
      credentials: "include",
    }),
    throwOnError: false,
    staleTime: Infinity,
    retry: 1,
  });
  const queryClient = useQueryClient();
  const onOpenIdConnectDone = useEffectEvent((event: MessageEvent) => {
    if (event.origin !== `${import.meta.env.VITE_DEV_SERVER_URL}`) {
      Logger.info("Redirect from popup failed");
      return;
    }

    const accessToken = event.data;

    if (typeof accessToken !== "string" || !accessToken) {
      return;
    }

    queryClient.setQueryData(createRefreshTokenQueryKey(), accessToken);
  });

  useEffect(() => {
    window.addEventListener("message", onOpenIdConnectDone);

    return () => {
      window.removeEventListener("message", onOpenIdConnectDone);
    };
  }, []);

  if (isPending) {
    return <Loader />;
  }

  return (
    <>
      <Outlet />
      <ToastContainer />
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}
