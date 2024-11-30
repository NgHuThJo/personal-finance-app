import { Outlet } from "react-router-dom";
import { AuthLayout } from "#frontend/features/auth/layout/layout";

export function AuthRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
