import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./board.module.css";
import { AddPotDialog } from "#frontend/features/pots/components/add-pot-dialog";
import { PotCard } from "#frontend/features/pots/components/pot-card";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllPotsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";

export function PotsBoard() {
  const { data } = useSuspenseQuery({
    ...getAllPotsOptions({
      client: clientWithAuth,
    }),
  });

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Pots</h1>
        <AddPotDialog />
      </header>
      {data.length ? (
        <ul className={styles.body}>
          {data.map((pot) => (
            <PotCard potData={pot} />
          ))}
        </ul>
      ) : (
        <p className={styles["status-report"]}>
          You have not created a pot yet.
        </p>
      )}
    </div>
  );
}
