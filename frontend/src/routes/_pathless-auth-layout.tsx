import { createFileRoute, Outlet } from "@tanstack/react-router";
import styles from "./_pathless-auth-layout.module.css";
import { Logo } from "#frontend/assets/icons/icons";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/_pathless-auth-layout")({
  beforeLoad: () => {
    const accessToken = accessTokenStore.getState().accessToken;

    if (accessToken) {
      throw Route.redirect({
        to: "./dashboard",
        replace: true,
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className={styles.layout}>
      <div className={styles.heading}>
        <Logo />
      </div>
      <div className={styles["grid-stack"]}>
        <img src="/hero-login.png" alt="hero image" className={styles.img} />
        <div className={styles["top-stack"]}>
          <Logo />
          <div className={styles.description}>
            <h2>Keep track of your money and save for your future</h2>
            <p>
              Personal finance app puts you in control of your spending. Track
              transations, set bdugets, and add to savings pots easily.
            </p>
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <Outlet />
      </div>
    </main>
  );
}
