import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import styles from "./add-budget-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type { CreateBudgetRequest } from "#frontend/shared/client";
import {
  createBudgetMutation,
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
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

export function AddBudgetDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
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
      setOpen(false);
    },
    onError: (error) => {
      Logger.error("Budget could not be created", error);

      switch (error.status) {
        case 400: {
          setError(`root.server-bad-request`, {
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
    onSettled: () => {
      reset();
    },
  });

  const handleAddBudgetSubmit = handleSubmit((data) => {
    const convertedData: CreateBudgetRequest = {
      category: data.category,
      maximum: data.maximum,
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
              data-testid="maximum-error"
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
              <FieldError>{errors.maximum?.message}</FieldError>
            )}
            {errors.root?.["server-bad-request"] && (
              <FieldError data-testid="add-Budget-server-bad-request">
                {errors.root["server-bad-request"].message}
              </FieldError>
            )}
          </Field>
          <Button type="submit" variant="cta-primary">
            +Add New Budget
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
