import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import styles from "./add-budget-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import {
  type EditBudgetRequest,
  type GetAllBudgetsResponse,
} from "#frontend/shared/client";
import {
  editBudgetMutation,
  getAllBudgetsQueryKey,
  getAllCategoriesOptions,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#frontend/shared/primitives/select";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

type EditBudgetDialogProps = {
  budgetData: GetAllBudgetsResponse;
  isEditDialogOpen: boolean;
  toggleEditDialog: (shouldOpen: boolean) => void;
};

export function EditBudgetDialog({
  budgetData: { id, maximum, category },
  isEditDialogOpen,
  toggleEditDialog,
}: EditBudgetDialogProps) {
  const queryClient = useQueryClient();
  const {
    register,
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<EditBudgetRequest>({
    defaultValues: {
      category,
      maximum,
    },
  });
  const { data: categoryData } = useQuery({
    ...getAllCategoriesOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
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
        case 401: {
          setError(`root.server-unauthorized`, {
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
      category: data.category,
      maximum: data.maximum,
    };

    mutate({
      body: convertedData,
      path: {
        budgetId: id,
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
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Controller
              name="category"
              defaultValue="bills"
              control={control}
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categoryData?.map((category) => (
                          <SelectItem value={category} key={category}>
                            {capitalizeFirstLetter(category)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <FieldError>{errors.category?.message}</FieldError>
                  )}
                </>
              )}
            ></Controller>
          </Field>
          <Field>
            <FieldLabel htmlFor="maximum">Maximum Spend</FieldLabel>
            <Input
              type="number"
              step="any"
              id="maximum"
              placeholder="$ e.g. 2000"
              {...register("maximum", {
                valueAsNumber: true,
                required: "Maximum spend required",
                min: {
                  value: 0.01,
                  message: "Minimum of 0.01",
                },
              })}
            />
            {errors.maximum && (
              <FieldError data-testid="maximum-error">
                {errors.maximum?.message}
              </FieldError>
            )}
            {errors.root?.["server-bad-request"] && (
              <FieldError data-testid="server-bad-request">
                {errors.root["server-bad-request"].message}
              </FieldError>
            )}
            {errors.root?.["server-unauthorized"] && (
              <FieldError data-testid="server-unauthorized">
                {errors.root["server-unauthorized"].message}
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
