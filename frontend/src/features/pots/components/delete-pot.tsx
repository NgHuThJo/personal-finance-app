import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
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
import { Spinner } from "#frontend/shared/primitives/spinner";

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
  const { mutate, isPending } = useMutation({
    ...deletePotMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: () => {
      Logger.info("Pot successfully deleted");
      queryClient.invalidateQueries({ queryKey: getAllPotsQueryKey() });
      toggleDeleteDialog(false);
      reset();
      toast.success("Pot successfully deleted");
    },
    onError: (error) => {
      toast.error(error.detail);
      Logger.error("Pot could not be deleted", error);

      setError(`root.server`, {
        type: String(error.type),
        message: String(error.detail),
      });
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : "Yes, confirm deletion"}
          </Button>
          <Button
            variant="abort"
            onClick={handleAbortDelete}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : "No, go back"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
