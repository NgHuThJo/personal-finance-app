import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthLayoutRoute } from "#frontend/app/routes/auth/auth";
import { ErrorRoute } from "#frontend/app/routes/error/error";
import { HomeRoute } from "#frontend/app/routes/app/home";
import { HomeLayoutRoute } from "#frontend/app/routes/app/home-layout";
import { NotFoundRoute } from "#frontend/app/routes/error/not-found";
import { BillsRoute } from "#frontend/app/routes/app/bills";
import { BudgetRoute } from "#frontend/app/routes/app/budget";
import { LoginRoute } from "#frontend/app/routes/auth/login";
import { PotRoute } from "#frontend/app/routes/app/pot";
import { RegistrationRoute } from "#frontend/app/routes/auth/registration";
import { TransactionRoute } from "#frontend/app/routes/app/transaction";

export const routesConfig = [
  {
    errorElement: <ErrorRoute />,
    children: [
      {
        path: "/",
        element: <AuthLayoutRoute />,
        children: [
          {
            index: true,
            element: <LoginRoute />,
          },
          {
            path: "register",
            element: <RegistrationRoute />,
          },
        ],
      },
      {
        path: "/app",
        element: <HomeLayoutRoute />,
        children: [
          {
            index: true,
            element: <HomeRoute />,
          },
          {
            path: "transactions",
            element: <TransactionRoute />,
          },
          {
            path: "budgets",
            element: <BudgetRoute />,
          },
          {
            path: "pots",
            element: <PotRoute />,
          },
          {
            path: "bills",
            element: <BillsRoute />,
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
