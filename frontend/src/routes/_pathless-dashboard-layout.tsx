import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import styles from "./_pathless-dashboard-layout.module.css";
import { DashboardNavigation } from "#frontend/features/dashboard/components/dashboard-navigation";
import { Logger } from "#frontend/shared/app/logging";
import { createRefreshTokenOptions } from "#frontend/shared/client/@tanstack/react-query.gen";

export const Route = createFileRoute("/_pathless-dashboard-layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { data } = useQuery({
    ...createRefreshTokenOptions({
      credentials: "include",
    }),
    throwOnError: false,
    enabled: false,
  });

  if (!data) {
    Logger.info("Access token generation from refresh token failed");
    return <Navigate to="/login" />;
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
