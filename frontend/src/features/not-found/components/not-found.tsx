import { useNavigate } from "@tanstack/react-router";
import styles from "./not-found.module.css";
import { icon_error, icon_retry } from "#frontend/assets/images";
import { Button } from "#frontend/shared/primitives/button";
import { Image } from "#frontend/shared/primitives/image";

export function NotFound() {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate({
      to: "/dashboard",
      replace: true,
    });
  };

  return (
    <div className={styles.layout}>
      <header className={styles["header"]}>
        <img src={icon_error} className={styles["error-icon"]} />
        <p>Something went wrong</p>
      </header>
      <div className={styles.body}>
        <p>
          The page you tried to visit does not exist. Please check the URL and
          retry.
        </p>
        <Button variant="cta-primary" onClick={handleRetry}>
          <Image src={icon_retry} />
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
