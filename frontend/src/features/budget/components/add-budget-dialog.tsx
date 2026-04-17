import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import styles from "./add-budget-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type { CreateBudgetRequest } from "#frontend/shared/client";
import {
  createBudgetMutation,
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
  DialogTrigger,
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
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "#frontend/shared/primitives/select";
import { colorHexList } from "#frontend/shared/utils/color";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

export function AddBudgetDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: budgetData } = useQuery({
    ...getAllBudgetsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
    enabled: false,
  });
  const {
    register,
    setError,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBudgetRequest>();
  const { data: categoryData } = useQuery({
    ...getAllCategoriesOptions({
      client: clientWithAuth,
    }),
  });
  const { mutate } = useMutation({
    ...createBudgetMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Budget successfully created");
      await queryClient.invalidateQueries({
        queryKey: getAllBudgetsQueryKey(),
      });
      reset();
      setOpen(false);
    },
    onError: (error) => {
      Logger.error("Budget could not be created", error);

      switch (error.status) {
        case 400: {
          setError(`root.add-budget-server-bad-request`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        case 401: {
          setError(`root.add-budget-server-unauthorized`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        default: {
          Logger.error(`Unknown error in ${AddBudgetDialog.name}`);
        }
      }
    },
  });

  const themeColorSet = new Set(budgetData?.map((budget) => budget.themeColor));
  const convertedColorHexList = colorHexList.map((hexColor) => ({
    ...hexColor,
    available: themeColorSet.has(hexColor.key) ? false : true,
  }));
  const defaultValue = convertedColorHexList.find(
    (value) => value.available,
  )?.key;

  const handleAddBudgetSubmit = handleSubmit((data) => {
    const convertedData: CreateBudgetRequest = {
      category: data.category,
      maximum: data.maximum,
      themeColor: data.themeColor,
    };

    mutate({
      body: convertedData,
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cta-primary">+Add New Budget</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add New Budget</DialogTitle>
        <DialogDescription>
          Choose a category to set a spending budget. These categories can help
          you monitor spending.
        </DialogDescription>
        <form className={styles.dialog} onSubmit={handleAddBudgetSubmit}>
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Controller
              name="category"
              defaultValue="Bills"
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
                  {errors.root?.["server-conflict"] && (
                    <FieldError data-testid="add-Budget-server-conflict">
                      {errors.root["server-conflict"].message}
                    </FieldError>
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
              data-testid="maximum"
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
            {errors.root?.["add-budget-server-bad-request"] && (
              <FieldError data-testid="add-budget-server-bad-request">
                {errors.root["add-budget-server-bad-request"].message}
              </FieldError>
            )}
            {errors.root?.["add-budget-server-unauthorized"] && (
              <FieldError data-testid="add-budget-server-unauthorized">
                {errors.root["add-budget-server-unauthorized"].message}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="theme-color">Theme</FieldLabel>
            <Controller
              name="themeColor"
              defaultValue={defaultValue}
              control={control}
              render={({ field }) => (
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
              )}
            ></Controller>
          </Field>
          <Button type="submit" variant="cta-primary">
            +Add New Budget
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
