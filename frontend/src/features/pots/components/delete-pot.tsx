import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import styles from "./delete-pot.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type { GetAllPotsResponse } from "#frontend/shared/client";
import {
  deletePotMutation,
  getAllPotsQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "#frontend/shared/primitives/dialog";
import { FieldError } from "#frontend/shared/primitives/field";

type DeletePotProps = {
  potData: GetAllPotsResponse;
  isDeleteDialogOpen: boolean;
  toggleDeleteDialog: (shouldOpen: boolean) => void;
};

export function DeletePotDialog({
  potData: { id, name },
  isDeleteDialogOpen,
  toggleDeleteDialog,
}: DeletePotProps) {
  const queryClient = useQueryClient();
  const {
    setError,
    reset,
    formState: { errors },
  } = useForm();
  const { mutate } = useMutation({
    ...deletePotMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Pot successfully deleted");
      await queryClient.invalidateQueries({ queryKey: getAllPotsQueryKey() });
      toggleDeleteDialog(false);
    },
    onError: (error) => {
      Logger.error("Pot could not be deleted", error);

      setError(`root.server`, {
        type: String(error.type),
        message: String(error.detail),
      });
    },

    onSettled: () => {
      reset();
    },
  });

  const handleDelete = () => {
    mutate({
      path: {
        potId: id,
      },
    });
  };

  const handleAbortDelete = () => {
    toggleDeleteDialog(false);
  };

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={toggleDeleteDialog}>
      <DialogContent showCloseButton={false} data-testid="delete-dialog">
        <DialogTitle>Delete "{name}"</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this pot? This action cannot be
          reversed, and all the data inside it will be removed forever.
        </DialogDescription>
        {errors.root?.["server"] && (
          <FieldError>{errors.root["server"].message}</FieldError>
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
