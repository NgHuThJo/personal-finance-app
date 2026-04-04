import { useState } from "react";
import styles from "./budget-card.module.css";
import { BudgetCardPopover } from "#frontend/features/budget/components/budget-popover";
import type { GetAllBudgetsResponse } from "#frontend/shared/client";

type BudgetCardProps = {
  budgetData: GetAllBudgetsResponse;
};

export function BudgetCard({ budgetData }: BudgetCardProps) {
  const [isEditDialogOpen, setEditDialog] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialog] = useState(false);
  const { id, category, maximum } = budgetData;

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
        <h2 className={styles["card-heading"]}>{category}</h2>
        <BudgetCardPopover
          dialogHandlers={{
            openDeleteDialog: openDeleteDialogInPopup,
            openEditDialog: openEditDialogInPopup,
          }}
        />
      </header>
      {/* <BudgetProgressBar
        description="Total saved"
        total={total}
        target={target}
      /> */}
      {/* {isEditDialogOpen && (
        <EditBudgetDialog
          BudgetData={budgetData}
          isEditDialogOpen={isEditDialogOpen}
          toggleEditDialog={toggleEditDialog}
        />
      )}
      {isDeleteDialogOpen && (
        <DeleteBudgetDialog
          BudgetData={budgetData}
          isDeleteDialogOpen={isDeleteDialogOpen}
          toggleDeleteDialog={toggleDeleteDialog}
        />
      )} */}
    </li>
  );
}
