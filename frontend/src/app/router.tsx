import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthRoute } from "#frontend/app/routes/auth";
import { ErrorRoute } from "#frontend/app/routes/error";
import { HomeRoute } from "#frontend/app/routes/home";
import { NotFoundRoute } from "#frontend/app/routes/not-found";
import { Budget } from "#frontend/features/budget/components/budget";
import { Home } from "#frontend/features/home/components/home";
import { Login } from "#frontend/features/auth/components/login/login";
import { Registration } from "#frontend/features/auth/components/registration/registration";
import { Transaction } from "#frontend/features/transaction/components/transaction";

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
            path: "register",
            element: <Registration />,
          },
        ],
      },
      {
        path: "/app",
        element: <HomeRoute />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "transactions",
            element: <Transaction />,
          },
          {
            path: "budgets",
            element: <Budget />,
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
