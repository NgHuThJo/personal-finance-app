import { useState } from "react";
import { Dots } from "#frontend/assets/icons/icons";
import type { GetAllBudgetsResponse } from "#frontend/shared/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#frontend/shared/primitives/card";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

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
    <Card>
      <CardHeader>
        <CardTitle>{capitalizeFirstLetter(category)}</CardTitle>
        <Dots />
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
    // <li key={id} className={styles.card}>
    //   <header className={styles["card-header"]}>
    //     <h2 className={styles["card-heading"]}>{category}</h2>
    //     <BudgetCardPopover
    //       dialogHandlers={{
    //         openDeleteDialog: openDeleteDialogInPopup,
    //         openEditDialog: openEditDialogInPopup,
    //       }}
    //     />
    //   </header>
    //   {/* <BudgetProgressBar
    //     description="Total saved"
    //     total={total}
    //     target={target}
    //   /> */}
    //   {/* {isEditDialogOpen && (
    //     <EditBudgetDialog
    //       BudgetData={budgetData}
    //       isEditDialogOpen={isEditDialogOpen}
    //       toggleEditDialog={toggleEditDialog}
    //     />
    //   )}
    //   {isDeleteDialogOpen && (
    //     <DeleteBudgetDialog
    //       BudgetData={budgetData}
    //       isDeleteDialogOpen={isDeleteDialogOpen}
    //       toggleDeleteDialog={toggleDeleteDialog}
    //     />
    //   )} */}
    // </li>
  );
}
