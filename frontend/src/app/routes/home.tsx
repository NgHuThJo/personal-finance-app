import { Outlet } from "react-router-dom";
import { HomeLayout } from "#frontend/features/home/components/layout/layout";

export function HomeRoute() {
  return (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  );
}
