import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "#frontend/providers/auth-context";
import { Logo } from "#frontend/components/ui/icon/icon";
import styles from "./auth-layout.module.css";
import { image_authentication } from "#frontend/assets/resources/images";

export function AuthLayout({ children }: PropsWithChildren) {
  const userId = useAuthStore((state) => state.userId);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      return navigate("/app");
    }
  }, [navigate, userId]);

  return (
    <main className={styles.container}>
      <div className={styles["logo-container"]}>
        <Logo />
      </div>
      <div className={styles["image-container"]}>
        <img src={image_authentication} alt="" className={styles.image} />
        <div>
          <Logo />
          <div>
            <h2>Keep track of your money and save for your future</h2>
            <p>
              Personal finance app puts you in control of your spending. Track
              transactions, set budgets, and add to savings pots easily.
            </p>
          </div>
        </div>
      </div>
      <div className={styles["form-container"]}>{children}</div>
    </main>
  );
}
