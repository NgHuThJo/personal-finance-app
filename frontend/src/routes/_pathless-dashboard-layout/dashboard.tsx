import { createFileRoute } from "@tanstack/react-router";
import styles from "./dashboard.module.css";
import { Logout } from "#frontend/assets/icons/icons";
import { BottomSummary } from "#frontend/features/dashboard/components/bottom-summary";
import { TopSummary } from "#frontend/features/dashboard/components/top-summary";
import { Button } from "#frontend/shared/primitives/button";

export const Route = createFileRoute("/_pathless-dashboard-layout/dashboard")({
  component: Index,
});

function Index() {
  return (
    <>
      <header className={styles.header}>
        <h1>Overview</h1>
        <Button variant="logout">
          <Logout />
          Logout
        </Button>
      </header>
      <TopSummary />
      <BottomSummary />
    </>
  );
}
