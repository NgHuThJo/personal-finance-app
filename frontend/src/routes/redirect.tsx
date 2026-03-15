import { createFileRoute } from "@tanstack/react-router";
import styles from "./redirect.module.css";
import { Logger } from "#frontend/shared/app/logging";

export const Route = createFileRoute("/redirect")({
  loader: () => {
    const accessToken = location.hash.substring(1);

    if (!accessToken) {
      Logger.error("URL hash has no access token", accessToken);
      window.close();
    }

    const targetWindow = window.opener as Window;
    targetWindow.postMessage(
      accessToken,
      `${import.meta.env.VITE_DEV_SERVER_URL}`,
    );

    window.close();
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={styles["page-loader"]}>
      <h1 className={styles["loading-text"]}></h1>
    </div>
  );
}
