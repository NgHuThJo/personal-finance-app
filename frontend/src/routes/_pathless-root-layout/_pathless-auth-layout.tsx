import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import styles from "./_pathless-auth-layout.module.css";
import { Logo } from "#frontend/assets/icons/icons";
import { useAccessToken } from "#frontend/shared/store/access-token";

export const Route = createFileRoute(
  "/_pathless-root-layout/_pathless-auth-layout",
)({
  component: AuthLayout,
});

function AuthLayout() {
  const accessToken = useAccessToken();
  const navigate = useNavigate();

  if (accessToken) {
    navigate({
      to: "/dashboard",
    });
  }

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
