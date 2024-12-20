import { Outlet } from "react-router";
import { AuthLayout } from "#frontend/features/auth/components/layouts/auth-layout";

export function AuthLayoutRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
