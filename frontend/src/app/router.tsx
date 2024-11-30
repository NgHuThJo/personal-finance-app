import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthRoute } from "#frontend/app/routes/auth";
import { ErrorRoute } from "#frontend/app/routes/error";
import { NotFoundRoute } from "#frontend/app/routes/not-found";
import { Login } from "#frontend/features/auth/login/login";
import { Registration } from "#frontend/features/auth/registration/registration";

export const routesConfig = [
  {
    errorElement: <ErrorRoute />,
    children: [
      {
        path: "/",
        element: <AuthRoute />,
        children: [
          {
            index: true,
            element: <Login />,
          },
          {
            path: "/register",
            element: <Registration />,
          },
        ],
      },
    ],
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
