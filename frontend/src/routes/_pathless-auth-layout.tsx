import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import styles from "./_pathless-auth-layout.module.css";
import { Logo } from "#frontend/assets/icons/icons";
import { useAccessToken } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/_pathless-auth-layout")({
  component: AuthLayout,
});

function AuthLayout() {
  const accessToken = useAccessToken();

  if (accessToken) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <main className={styles.page}>
      <div className={styles["page-header"]}>
        <Logo />
      </div>
      <div className={styles["hero"]}>
        <img
          src="/hero-login.png"
          alt="hero image"
          className={styles["hero-image"]}
        />
        <div className={styles["hero-content"]}>
          <Logo />
          <div className={styles["hero-description"]}>
            <h2>Keep track of your money and save for your future</h2>
            <p>
              Personal finance app puts you in control of your spending. Track
              transations, set bdugets, and add to savings pots easily.
            </p>
          </div>
        </div>
      </div>
      <div className={styles["auth-panel"]}>
        <Outlet />
      </div>
    </main>
  );
}
