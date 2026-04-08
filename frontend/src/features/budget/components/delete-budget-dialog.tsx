import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import styles from "./delete-budget-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type { GetAllBudgetsResponse } from "#frontend/shared/client";
import {
  deleteBudgetMutation,
  getAllBudgetsQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "#frontend/shared/primitives/dialog";
import { FieldError } from "#frontend/shared/primitives/field";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

type DeleteBudgetProps = {
  budgetData: GetAllBudgetsResponse;
  isDeleteDialogOpen: boolean;
  toggleDeleteDialog: (shouldOpen: boolean) => void;
};

export function DeleteBudgetDialog({
  budgetData: { id, category },
  isDeleteDialogOpen,
  toggleDeleteDialog,
}: DeleteBudgetProps) {
  const queryClient = useQueryClient();
  const {
    setError,
    formState: { errors },
  } = useForm();
  const { mutate } = useMutation({
    ...deleteBudgetMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Budget successfully deleted");
      await queryClient.invalidateQueries({
        queryKey: getAllBudgetsQueryKey(),
      });
      toggleDeleteDialog(false);
    },
    onError: (error) => {
      Logger.error("Budget could not be deleted", error);

      setError(`root.server-unauthorized`, {
        type: String(error.type),
        message: String(error.detail),
      });
    },
  });

  const handleDelete = () => {
    mutate({
      path: {
        budgetId: id,
      },
    });
  };

  const handleAbortDelete = () => {
    toggleDeleteDialog(false);
  };

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={toggleDeleteDialog}>
      <DialogContent showCloseButton={false} data-testid="delete-dialog">
        <DialogTitle>Delete "{capitalizeFirstLetter(category)}"</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this Budget? This action cannot be
          reversed, and all the data inside it will be removed forever.
        </DialogDescription>
        {errors.root?.["server-unauthorized"] && (
          <FieldError>{errors.root["server-unauthorized"].message}</FieldError>
        )}
        <div className={styles["cta-layout"]}>
          <Button variant="destructive" onClick={handleDelete}>
            Yes, confirm deletion
          </Button>
          <Button variant="abort" onClick={handleAbortDelete}>
            No, go back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
