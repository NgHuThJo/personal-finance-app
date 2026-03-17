import { useQuery, type QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, useEffectEvent } from "react";
import styles from "./__root.module.css";
import { Logger } from "#frontend/shared/app/logging";
import { createRefreshTokenOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import {
  accessTokenStore,
  useAccessToken,
} from "#frontend/shared/store/access-token";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: Root,
  },
);

let isAuthBootstrapped = false;

function Root() {
  const onOpenIdConnectDone = useEffectEvent((event: MessageEvent) => {
    if (event.origin !== `${import.meta.env.VITE_DEV_SERVER_URL}`) {
      Logger.info("Redirect from popup failed");
      return;
    }

    const accessToken = event.data;

    if (typeof accessToken !== "string" || !accessToken) {
      return;
    }

    setAccessToken(accessToken);
  });
  const accessToken = useAccessToken();
  const { setAccessToken } = accessTokenStore.getState();
  const { data, error, isPending } = useQuery({
    ...createRefreshTokenOptions({
      credentials: "include",
    }),
    throwOnError: false,
    enabled: !isAuthBootstrapped,
    retry: 1,
  });

  useEffect(() => {
    window.addEventListener("message", onOpenIdConnectDone);

    if (error) {
      Logger.error("Access token creation with refresh token failed", error);
    }

    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }

    if (!isPending) {
      isAuthBootstrapped = true;
    }

    return () => {
      window.removeEventListener("message", onOpenIdConnectDone);
    };
  }, [data, setAccessToken, isPending, error]);

  if (isPending) {
    return (
      <div className={styles["page-loader"]}>
        <h1 className={styles["loading-text"]}></h1>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
