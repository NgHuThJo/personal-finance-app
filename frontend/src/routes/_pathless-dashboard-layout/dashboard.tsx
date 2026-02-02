import { createFileRoute, useRouter } from "@tanstack/react-router";
import styles from "./dashboard.module.css";
import { Logout } from "#frontend/assets/icons/icons";
import { BottomSummary } from "#frontend/features/dashboard/components/bottom-summary";
import { TopSummary } from "#frontend/features/dashboard/components/top-summary";
import { Logger } from "#frontend/shared/app/logging";
import { Button } from "#frontend/shared/primitives/button";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createFileRoute(
  "/_pathless-dashboard-layout/dashboard",
)({
  component: Index,
});

function Index() {
  const router = useRouter();
  const logout = accessTokenStore.getState().logout;

  const onClickLogout = () => {
    Logger.info("User logs out");
    logout();
    router.invalidate();
  };

  return (
    <>
      <header className={styles.header}>
        <h1>Overview</h1>
        <Button variant="logout" onClick={onClickLogout}>
          <Logout />
          Logout
        </Button>
      </header>
      <TopSummary />
      <BottomSummary />
    </>
  );
}
