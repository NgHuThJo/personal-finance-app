import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
} from "#frontend/shared/app/constants";
import { LocationStoreProvider } from "#frontend/shared/store/location";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: Root,
  },
);

function Root() {
  return (
    <>
      <LocationStoreProvider
        latitude={DEFAULT_LATITUDE}
        longitude={DEFAULT_LONGITUDE}
      >
        <Outlet />
      </LocationStoreProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}
