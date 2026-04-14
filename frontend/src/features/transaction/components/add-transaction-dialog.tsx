import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import styles from "./add-transaction-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type { CreateTransactionRequest } from "#frontend/shared/client";
import {
  createTransactionMutation,
  getAllCategoriesOptions,
  getAllTransactionsQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import { Checkbox } from "#frontend/shared/primitives/checkbox";
import {
  Dialog,
  DialogContent,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#frontend/shared/primitives/select";

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    setError,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTransactionRequest>();
  const { data: categoryData } = useQuery({
    ...getAllCategoriesOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });
  const { mutate } = useMutation({
    ...createTransactionMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Transaction successfully created");
      await queryClient.invalidateQueries({
        queryKey: getAllTransactionsQueryKey(),
      });
      reset();
      setOpen(false);
    },
    onError: (error) => {
      Logger.error("Transaction could not be created", error);

      switch (error.status) {
        case 400: {
          setError(`root.server-bad-request`, {
            type: String(error.type),
            message: String(error.detail ?? "Invalid value"),
          });
          break;
        }
        case 422: {
          setError(`root.server-unprocessable-content`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        default: {
          Logger.error(`Unknown error in ${AddTransactionDialog.name}`);
        }
      }
    },
  });

  const handleAddPotSubmit = handleSubmit((data) => {
    const convertedData: CreateTransactionRequest = {
      amount: data.amount,
      category: data.category,
      isRecurring: data.isRecurring,
      recipientEmail: data.recipientEmail,
      transactionDate: data.transactionDate,
    };

    mutate({
      body: convertedData,
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="cta-primary">
          +Add New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add New Transaction</DialogTitle>
        <form className={styles.dialog} onSubmit={handleAddPotSubmit}>
          <Field>
            <FieldLabel htmlFor="recipient-email">Transaction Email</FieldLabel>
            <Input
              type="text"
              id="recipient-email"
              data-testid="recipient-email-error"
              placeholder="e.g. Urban Services Hub"
              {...register("recipientEmail", {
                required: "Recipient email address required",
              })}
            />
            {errors.recipientEmail && (
              <FieldError>{errors.recipientEmail?.message}</FieldError>
            )}
            {errors.root?.["server-unprocessable-content"] && (
              <FieldError data-testid="add-transaction-server-unprocessable-content">
                {errors.root["server-unprocessable-content"].message}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="transaction-date">Transaction Date</FieldLabel>
            <Input
              type="date"
              step="any"
              id="transaction-date"
              data-testid="transaction-date-error"
              placeholder="$ e.g. 2000"
              {...register("transactionDate", {
                valueAsDate: true,
                required: "Transaction date required",
              })}
            />
            {errors.transactionDate && (
              <FieldError>{errors?.transactionDate.message}</FieldError>
            )}
            {errors.root?.["server-bad-request"] && (
              <FieldError data-testid="-server-bad-request">
                {errors.root["server-bad-request"].message}
              </FieldError>
            )}
          </Field>
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
                            {category}
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
            <FieldLabel htmlFor="transaction-amount">Amount</FieldLabel>
            <Input
              type="number"
              step="any"
              id="transaction-amount"
              data-testid="transaction-amount"
              placeholder="$ e.g. 1000"
              {...register("amount", {
                valueAsNumber: true,
                required: "Transaction amount required",
                min: {
                  value: 0.01,
                  message: "Minimum of 0.01",
                },
              })}
            />
            {errors.amount && (
              <FieldError data-testid="transaction-amount-error">
                {errors.amount?.message}
              </FieldError>
            )}
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="recurring">Recurring</FieldLabel>
            <Controller
              name="isRecurring"
              control={control}
              render={({ field }) => (
                <>
                  <Checkbox
                    id="recurring"
                    checked={field.value}
                    onCheckedChange={(value) => field.onChange(value === true)}
                  />
                  {errors.isRecurring && (
                    <FieldError data-testid="recurring-error">
                      {errors.isRecurring?.message}
                    </FieldError>
                  )}
                </>
              )}
            ></Controller>
          </Field>
          <Button type="submit" variant="cta-primary">
            +Add New Pot
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
