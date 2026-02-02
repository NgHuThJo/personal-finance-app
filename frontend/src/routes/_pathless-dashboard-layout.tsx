import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import styles from "./_pathless-dashboard-layout.module.css";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/_pathless-dashboard-layout")({
  beforeLoad: async () => {
    const accessToken = accessTokenStore.getState().accessToken;

    if (!accessToken) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <>
      <main className={styles.layout}>
        <Outlet />
      </main>
      <nav className={styles.navigation}></nav>
    </>
  );
}
