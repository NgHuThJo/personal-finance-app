import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import styles from "./board.module.css";
import { AddMoneyToPotDialog } from "#frontend/features/pots/components/add-money-to-pot";
import { AddPotDialog } from "#frontend/features/pots/components/add-pot-dialog";
import { DeletePotDialog } from "#frontend/features/pots/components/delete-pot";
import { EditPotDialog } from "#frontend/features/pots/components/edit-pot.dialog";
import { PotCardPopover } from "#frontend/features/pots/components/pot-card-popover";
import { PotProgressBar } from "#frontend/features/pots/components/pot-progress-bar";
import { WithdrawMoneyDialog } from "#frontend/features/pots/components/withdraw-money-dialog";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllPotsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";

export function PotsBoard() {
  const [isEditDialogOpen, setEditDialog] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialog] = useState(false);
  const { data } = useSuspenseQuery({
    ...getAllPotsOptions({
      client: clientWithAuth,
    }),
  });

  const openEditDialogInPopup = () => {
    setEditDialog(true);
  };
  const openDeleteDialogInPopup = () => {
    setDeleteDialog(true);
  };
  const toggleEditDialog = (shouldOpen: boolean) => {
    setEditDialog(shouldOpen);
  };
  const toggleDeleteDialog = (shouldOpen: boolean) => {
    setDeleteDialog(shouldOpen);
  };

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
                <PotCardPopover
                  dialogHandlers={{
                    openDeleteDialog: openDeleteDialogInPopup,
                    openEditDialog: openEditDialogInPopup,
                  }}
                />
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
              {isEditDialogOpen && (
                <EditPotDialog
                  potData={pot}
                  isEditDialogOpen={isEditDialogOpen}
                  toggleEditDialog={toggleEditDialog}
                />
              )}
              {isDeleteDialogOpen && (
                <DeletePotDialog
                  potData={pot}
                  isDeleteDialogOpen={isDeleteDialogOpen}
                  toggleDeleteDialog={toggleDeleteDialog}
                />
              )}
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
