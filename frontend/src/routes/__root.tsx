import { useQuery, type QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import styles from "./__root.module.css";
import { Logger } from "#frontend/shared/app/logging";
import { getApiAuthRefreshOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: Root,
  },
);

let isAuthBootstrapped = false;

function Root() {
  const { setAccessToken } = accessTokenStore.getState();
  const { data, error, isPending } = useQuery({
    ...getApiAuthRefreshOptions({
      credentials: "include",
    }),
    throwOnError: false,
    enabled: !isAuthBootstrapped,
    // retry: 3,
  });

  useEffect(() => {
    if (error) {
      Logger.error("Access token creation with refresh token failed", error);
    }

    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }

    if (isPending) {
      isAuthBootstrapped = true;
    }
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
