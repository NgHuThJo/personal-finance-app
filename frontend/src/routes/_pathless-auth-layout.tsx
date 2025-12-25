import { createFileRoute, Outlet } from "@tanstack/react-router";
import styles from "./_pathless-auth-layout.module.css";

export const Route = createFileRoute("/_pathless-auth-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className={styles.layout}>
      <img src="/hero-login.png" alt="hero image" className={styles.img} />
      <div className={styles.right}>
        <Outlet />
      </div>
    </main>
  );
}
