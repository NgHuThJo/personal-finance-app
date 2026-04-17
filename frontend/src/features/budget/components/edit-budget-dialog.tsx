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
  getAllBudgetsOptions,
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
import { colorHexList } from "#frontend/shared/utils/color";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

type EditBudgetDialogProps = {
  budgetData: GetAllBudgetsResponse;
  isEditDialogOpen: boolean;
  toggleEditDialog: (shouldOpen: boolean) => void;
};

export function EditBudgetDialog({
  budgetData: { id, maximum, category, themeColor },
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
  const { data: budgetData } = useQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
    enabled: false,
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

  const themeColorSet = new Set(budgetData?.map((budget) => budget.themeColor));
  const convertedColorHexList = colorHexList.map((hexColor) => ({
    ...hexColor,
    available:
      themeColorSet.has(hexColor.key) && hexColor.key !== themeColor
        ? false
        : true,
  }));

  const handleAddBudgetSubmit = handleSubmit((data) => {
    const convertedData: EditBudgetRequest = {
      category: data.category,
      maximum: data.maximum,
      themeColor: data.themeColor,
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
              defaultValue={category}
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
          <Field>
            <FieldLabel htmlFor="theme-color">Theme</FieldLabel>
            <Controller
              name="themeColor"
              defaultValue={themeColor}
              control={control}
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="theme-color">
                      <SelectValue placeholder="Select a theme color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {convertedColorHexList?.map(
                          ({ key, value, available }) => (
                            <SelectItem
                              value={key}
                              key={key}
                              disabled={!available}
                            >
                              <div className={styles["theme"]}>
                                <span
                                  className={styles["theme-circle"]}
                                  style={{
                                    "--color-theme-circle": `${value}`,
                                  }}
                                />
                                <span>
                                  {key}&nbsp;
                                  {`${!available ? "(Already in use)" : ""}`}
                                </span>
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.themeColor && (
                    <FieldError>{errors.themeColor?.message}</FieldError>
                  )}
                </>
              )}
            ></Controller>
          </Field>
          <Button type="submit" variant="cta-primary">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
