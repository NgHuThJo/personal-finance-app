import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import styles from "./_pathless-dashboard-layout.module.css";
import { DashboardNavigation } from "#frontend/features/dashboard/components/dashboard-navigation";
import { useAccessToken } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/_pathless-dashboard-layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const accessToken = useAccessToken();
  const navigate = useNavigate();
  const currentLocation = useLocation();

  console.log(
    "in dashboard layout route and access token",
    currentLocation,
    accessToken,
  );

  useEffect(() => {
    if (!accessToken) {
      navigate({
        to: "/login",
      });
    }
  }, [accessToken, currentLocation, navigate]);

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
