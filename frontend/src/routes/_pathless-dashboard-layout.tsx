import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import styles from "./_pathless-dashboard-layout.module.css";
import { Logger } from "#frontend/shared/app/logging";
import { useAccessToken } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/_pathless-dashboard-layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const accessToken = useAccessToken();

  if (!accessToken) {
    Logger.info("in dashboard layout");
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <main className={styles.layout}>
        <Outlet />
      </main>
      <nav className={styles.navigation}></nav>
    </>
  );
}
