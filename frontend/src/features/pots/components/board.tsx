import styles from "./board.module.css";
import { Button } from "#frontend/shared/primitives/button";

export function PotsBoard() {
  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.heading}>Pots</h1>
        <Button variant="logout" size="lg">
          +Add New Pot
        </Button>
      </header>
      <div className={styles.body}></div>
    </div>
  );
}
