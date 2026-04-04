import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import styles from "./add-budget-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type {
  EditBudgetRequest,
  GetAllBudgetsResponse,
} from "#frontend/shared/client";
import {
  editBudgetMutation,
  getAllBudgetsQueryKey,
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

type EditBudgetDialogProps = {
  BudgetData: GetAllBudgetsResponse;
  isEditDialogOpen: boolean;
  toggleEditDialog: (shouldOpen: boolean) => void;
};

export function EditBudgetDialog({
  BudgetData: { id, maximum, category },
  isEditDialogOpen,
  toggleEditDialog,
}: EditBudgetDialogProps) {
  const queryClient = useQueryClient();
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<EditBudgetRequest>({
    defaultValues: {
      BudgetName: name,
      newTarget: target,
    },
  });
  const { mutate } = useMutation({
    ...editBudgetMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Budget successfully edited");
      await queryClient.invalidateQueries({
        queryKey: getAllBudgetsQueryKey(),
      });
      toggleEditDialog(false);
    },
    onError: (error) => {
      Logger.error("Budget could not be edited", error);

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
          Logger.error(`Unknown error in ${EditBudgetDialog.name}`);
        }
      }
    },
  });

  const handleAddBudgetSubmit = handleSubmit((data) => {
    const convertedData: EditBudgetRequest = {
      BudgetName: data.BudgetName,
      newTarget: data.newTarget,
    };

    mutate({
      body: convertedData,
      path: {
        BudgetId: id,
      },
    });
  });

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={toggleEditDialog}>
      <DialogContent>
        <DialogTitle>Edit Budget</DialogTitle>
        <DialogDescription>
          If your saving targets change, feel free to update your Budgets.
        </DialogDescription>
        <form className={styles.dialog} onSubmit={handleAddBudgetSubmit}>
          <Field>
            <FieldLabel htmlFor="name">Budget Name</FieldLabel>
            <Input
              type="text"
              id="name"
              placeholder="e.g. Rainy Days"
              {...register("BudgetName", {
                required: "Budget name required",
              })}
            />
            {errors.BudgetName && (
              <FieldError data-testid="edit-Budget-Budgetname-error">
                {errors.BudgetName?.message}
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
              <FieldError data-testid="edit-Budget-target-error">
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
