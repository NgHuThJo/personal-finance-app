import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./board.module.css";
import { AddMoneyToPotDialog } from "#frontend/features/pots/components/add-money-to-pot";
import { AddPotDialog } from "#frontend/features/pots/components/add-pot-dialog";
import { PotCardPopup } from "#frontend/features/pots/components/pot-card-popup";
import { PotProgressBar } from "#frontend/features/pots/components/pot-progress-bar";
import { WithdrawMoneyDialog } from "#frontend/features/pots/components/withdraw-money-dialog";
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
            <li key={pot.id} className={styles.card}>
              <header className={styles["card-header"]}>
                <h2 className={styles["card-heading"]}>{pot.name}</h2>
                <PotCardPopup potData={pot} />
              </header>
              <PotProgressBar
                description="Total saved"
                total={pot.total}
                target={pot.target}
              />
              <div className={styles["card-footer"]}>
                <AddMoneyToPotDialog potData={pot} />
                <WithdrawMoneyDialog potData={pot} />
              </div>
            </li>
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
