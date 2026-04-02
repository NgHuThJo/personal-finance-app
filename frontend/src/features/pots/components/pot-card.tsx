import { useState } from "react";
import styles from "./pot-card.module.css";
import { AddMoneyToPotDialog } from "#frontend/features/pots/components/add-money-to-pot";
import { DeletePotDialog } from "#frontend/features/pots/components/delete-pot";
import { EditPotDialog } from "#frontend/features/pots/components/edit-pot.dialog";
import { PotCardPopover } from "#frontend/features/pots/components/pot-card-popover";
import { PotProgressBar } from "#frontend/features/pots/components/pot-progress-bar";
import { WithdrawMoneyDialog } from "#frontend/features/pots/components/withdraw-money-dialog";
import type { GetAllPotsResponse } from "#frontend/shared/client";

type PotCardProps = {
  potData: GetAllPotsResponse;
};

export function PotCard({ potData }: PotCardProps) {
  const [isEditDialogOpen, setEditDialog] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialog] = useState(false);
  const { id, name, target, total } = potData;

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
    <li key={id} className={styles.card}>
      <header className={styles["card-header"]}>
        <h2 className={styles["card-heading"]}>{name}</h2>
        <PotCardPopover
          dialogHandlers={{
            openDeleteDialog: openDeleteDialogInPopup,
            openEditDialog: openEditDialogInPopup,
          }}
        />
      </header>
      <PotProgressBar description="Total saved" total={total} target={target} />
      <div className={styles["card-footer"]}>
        <AddMoneyToPotDialog potData={potData} />
        <WithdrawMoneyDialog potData={potData} />
      </div>
      {isEditDialogOpen && (
        <EditPotDialog
          potData={potData}
          isEditDialogOpen={isEditDialogOpen}
          toggleEditDialog={toggleEditDialog}
        />
      )}
      {isDeleteDialogOpen && (
        <DeletePotDialog
          potData={potData}
          isDeleteDialogOpen={isDeleteDialogOpen}
          toggleDeleteDialog={toggleDeleteDialog}
        />
      )}
    </li>
  );
}
