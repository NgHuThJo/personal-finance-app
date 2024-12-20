import { Outlet } from "react-router";
import { HomeLayout } from "#frontend/features/home/components/layouts/home-layout";

export function HomeLayoutRoute() {
  return (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  );
}
