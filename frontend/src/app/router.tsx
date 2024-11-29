import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorRoute } from "#frontend/app/routes/error";
import { NotFoundRoute } from "#frontend/app/routes/not-found";

export const routesConfig = [
  {
    errorElement: <ErrorRoute />,
  },
  {
    path: "*",
    element: <NotFoundRoute />,
  },
];

export function Router() {
  const router = createBrowserRouter(routesConfig);

  return <RouterProvider router={router} />;
}
