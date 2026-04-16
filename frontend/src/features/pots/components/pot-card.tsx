import { useState } from "react";
import styles from "./pot-card.module.css";
import { AddMoneyToPotDialog } from "#frontend/features/pots/components/add-money-to-pot";
import { DeletePotDialog } from "#frontend/features/pots/components/delete-pot";
import { EditPotDialog } from "#frontend/features/pots/components/edit-pot.dialog";
import { PotCardPopover } from "#frontend/features/pots/components/pot-card-popover";
import { PotProgressBar } from "#frontend/features/pots/components/pot-progress-bar";
import { WithdrawMoneyDialog } from "#frontend/features/pots/components/withdraw-money-dialog";
import type { GetAllPotsResponse } from "#frontend/shared/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#frontend/shared/primitives/card";
import { getColorHexCode } from "#frontend/shared/utils/color";

type PotCardProps = {
  potData: GetAllPotsResponse;
};

export function PotCard({ potData }: PotCardProps) {
  const [isEditDialogOpen, setEditDialog] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialog] = useState(false);
  const { name, target, total, themeColor } = potData;

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
    <Card>
      <CardHeader>
        <CardTitle>
          <div className={styles["theme-heading"]}>
            <span
              className={styles["theme-icon"]}
              style={{
                "--color-theme-icon": `${getColorHexCode(themeColor)}`,
              }}
            ></span>
            <span>{name}</span>
          </div>
        </CardTitle>
        <PotCardPopover
          dialogHandlers={{
            openDeleteDialog: openDeleteDialogInPopup,
            openEditDialog: openEditDialogInPopup,
          }}
        />
      </CardHeader>
      <CardContent>
        <PotProgressBar
          description="Total saved"
          total={total}
          target={target}
        />
        <CardFooter>
          <AddMoneyToPotDialog potData={potData} />
          <WithdrawMoneyDialog potData={potData} />
        </CardFooter>
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
      </CardContent>
    </Card>
  );
}
