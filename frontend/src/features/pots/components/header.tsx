import styles from "./header.module.css";
import { Button } from "#frontend/shared/primitives/button";

export function PotsHeader() {
  return (
    <header className={styles.layout}>
      <h1>Pots</h1>
      <Button>+Add New Pot</Button>
    </header>
  );
}
