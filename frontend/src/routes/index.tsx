import { createFileRoute } from "@tanstack/react-router";
import styles from "./index.module.css";
import { Logout } from "#frontend/assets/icons/icons";
import { Summary } from "#frontend/features/dashboard/components/summary/summary";
import { Button } from "#frontend/shared/primitives/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className={styles.layout}>
      <header className={styles.header}>
        <h1>Overview</h1>
        <Button variant="log">
          <Logout />
          Logout
        </Button>
      </header>
      <Summary />
    </main>
  );
}
