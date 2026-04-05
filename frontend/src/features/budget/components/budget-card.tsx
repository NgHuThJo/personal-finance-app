import { Link } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./budget-card.module.css";
import { Dots } from "#frontend/assets/icons/icons";
import { BudgetProgressBar } from "#frontend/features/budget/components/budget-progressbar";
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
  transactionAmount: number;
};

export function BudgetCard({ budgetData, transactionAmount }: BudgetCardProps) {
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
      <CardContent>
        <BudgetProgressBar maximum={maximum} spent={transactionAmount} />
      </CardContent>
      <CardFooter>
        <div className={styles["footer-header"]}>
          <h2 className={styles["footer-heading"]}>Latest Spending</h2>
          <Link to="/transactions">See All</Link>
        </div>
        <p className={styles["footer-text"]}>
          You haven't made any spendings yet.
        </p>
      </CardFooter>
    </Card>
  );
}
