import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import styles from "./_pathless-dashboard-layout.module.css";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createFileRoute(
  "/_pathless-root-layout/_pathless-dashboard-layout",
)({
  beforeLoad: () => {
    const accessToken = accessTokenStore.getState().accessToken;

    if (!accessToken) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <main className={styles.layout}>
        <Outlet />
      </main>
      <nav className={styles.navigation}></nav>
    </>
  );
}
