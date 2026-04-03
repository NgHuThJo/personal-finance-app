import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import styles from "./add-pot-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type {
  EditPotRequest,
  GetAllPotsResponse,
} from "#frontend/shared/client";
import {
  editPotMutation,
  getAllPotsQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "#frontend/shared/primitives/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
} from "#frontend/shared/primitives/field";
import { Input } from "#frontend/shared/primitives/input";

type EditPotDialogProps = {
  potData: GetAllPotsResponse;
  isEditDialogOpen: boolean;
  toggleEditDialog: (shouldOpen: boolean) => void;
};

export function EditPotDialog({
  potData: { id, name, target },
  isEditDialogOpen,
  toggleEditDialog,
}: EditPotDialogProps) {
  const queryClient = useQueryClient();
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPotRequest>({
    defaultValues: {
      potName: name,
      newTarget: target,
    },
  });
  const { mutate } = useMutation({
    ...editPotMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Pot successfully edited");
      await queryClient.invalidateQueries({ queryKey: getAllPotsQueryKey() });
      toggleEditDialog(false);
    },
    onError: (error) => {
      Logger.error("Pot could not be edited", error);

      switch (error.status) {
        case 400: {
          setError(`root.server-bad-request`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        case 409: {
          setError(`root.server-conflict`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        default: {
          Logger.error(`Unknown error in ${EditPotDialog.name}`);
        }
      }
    },
  });

  const handleAddPotSubmit = handleSubmit((data) => {
    const convertedData: EditPotRequest = {
      potName: data.potName,
      newTarget: data.newTarget,
    };

    mutate({
      body: convertedData,
      path: {
        potId: id,
      },
    });
  });

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={toggleEditDialog}>
      <DialogContent>
        <DialogTitle>Edit Pot</DialogTitle>
        <DialogDescription>
          If your saving targets change, feel free to update your pots.
        </DialogDescription>
        <form className={styles.dialog} onSubmit={handleAddPotSubmit}>
          <Field>
            <FieldLabel htmlFor="name">Pot Name</FieldLabel>
            <Input
              type="text"
              id="name"
              placeholder="e.g. Rainy Days"
              {...register("potName", {
                required: "Pot name required",
              })}
            />
            {errors.potName && (
              <FieldError data-testid="edit-pot-potname-error">
                {errors.potName?.message}
              </FieldError>
            )}
            {errors.root?.["server-conflict"] && (
              <FieldError data-testid="server-conflict">
                {errors.root["server-conflict"].message}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="target">Target Amount</FieldLabel>
            <Input
              type="number"
              step="any"
              id="target"
              placeholder="$ e.g. 2000"
              {...register("newTarget", {
                valueAsNumber: true,
                required: "Target amount required",
                min: {
                  value: 0.01,
                  message: "Minimum of 0.01",
                },
              })}
            />
            {errors.newTarget && (
              <FieldError data-testid="edit-pot-target-error">
                {errors.newTarget?.message}
              </FieldError>
            )}
            {errors.root?.["server-bad-request"] && (
              <FieldError data-testid="server-bad-request">
                {errors.root["server-bad-request"].message}
              </FieldError>
            )}
          </Field>
          <Button type="submit" variant="cta-primary">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
