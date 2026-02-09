import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import styles from "./_pathless-dashboard-layout.module.css";
import { DashboardNavigation } from "#frontend/features/dashboard/components/dashboard-navigation";
import { useAccessToken } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/_pathless-dashboard-layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const accessToken = useAccessToken();

  if (!accessToken) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className={styles.page}>
      <main className={styles.layout}>
        <Outlet />
      </main>
      <div className={styles["nav-wrapper"]}>
        <DashboardNavigation />
      </div>
    </div>
  );
}
