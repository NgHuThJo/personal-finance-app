import { Outlet } from "react-router-dom";
import { AuthLayout } from "#frontend/features/auth/components/layouts/auth-layout";

export function AuthRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
