import { createMemoryRouter, RouterProvider } from "react-router";
import { routesConfig } from "#frontend/app/router";

type MemoryRouterOptions = Parameters<typeof createMemoryRouter>[1];

export const createTestRouter = (opts: MemoryRouterOptions) => {
  const router = createMemoryRouter(routesConfig, opts);

  return <RouterProvider router={router} />;
};
