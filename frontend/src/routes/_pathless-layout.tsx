import { createFileRoute, Outlet } from "@tanstack/react-router";
import styles from "./_pathless-layout.module.css";

export const Route = createFileRoute("/_pathless-layout")({
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
