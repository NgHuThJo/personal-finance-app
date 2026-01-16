import { createFileRoute, Outlet } from "@tanstack/react-router";
import styles from "./_pathless-dashboard-layout.module.css";

export const Route = createFileRoute("/_pathless-dashboard-layout")({
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
