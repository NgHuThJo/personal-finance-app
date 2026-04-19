import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import styles from "./add-money-to-pot.module.css";
import { PotProgressBar } from "#frontend/features/pots/components/pot-progress-bar";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type {
  AddMoneyToPotRequest,
  GetAllPotsResponse,
} from "#frontend/shared/client";
import {
  addMoneyToPotMutation,
  getAllPotsQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "#frontend/shared/primitives/dialog";
import {
  Field,
  FieldLabel,
  FieldError,
} from "#frontend/shared/primitives/field";
import { Input } from "#frontend/shared/primitives/input";

type AddMoneyToPotProps = {
  potData: GetAllPotsResponse;
};

export function AddMoneyToPotDialog({
  potData: { id, name, target, total, themeColor },
}: AddMoneyToPotProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddMoneyToPotRequest>({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const { mutate } = useMutation({
    ...addMoneyToPotMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Money successfully deposited in pot");
      await queryClient.invalidateQueries({
        queryKey: getAllPotsQueryKey(),
      });
      reset();
    },
    onError: (error) => {
      Logger.info("Deposit to pot failed", error);

      switch (error.status) {
        case 422: {
          setError("root.server-unprocessable-content", {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        default: {
          Logger.error(`Unknown error in ${AddMoneyToPotDialog.name}`);
        }
      }
    },
  });
  const amountToAdd = useWatch({
    name: "addAmount",
    defaultValue: 0,
    control,
  });

  const handleAddPotSubmit = handleSubmit((data) => {
    mutate({
      body: data,
      path: {
        potId: id,
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cta-secondary" size="lg">
          +Add Money
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{`Add to "${name}"`}</DialogTitle>
        <DialogDescription>
          Add money to your pot to keep it separate from your main balance. As
          soon as you add this money, it will be deducted from your current
          balance.
        </DialogDescription>
        <form className={styles.dialog} onSubmit={handleAddPotSubmit}>
          <PotProgressBar
            description="New Amount"
            total={total + amountToAdd}
            target={target}
            themeColor={themeColor}
          />
          <Field>
            <FieldLabel htmlFor="money-added">Amount to add</FieldLabel>
            <Controller
              name="addAmount"
              control={control}
              rules={{
                required: "Amount is required",
                validate: {
                  isNumber: (value) =>
                    !Number.isNaN(value) || "Must be a number",
                  positive: (value) => value > 0 || "Must be greater 0",
                  withinTarget: (value) =>
                    value + total <= target || `Max is ${target - total}`,
                },
              }}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    id="money-added"
                    placeholder="$ e.g. 2000"
                    onChange={(e) => {
                      let convertedValue = e.currentTarget.valueAsNumber;

                      if (Number.isNaN(convertedValue) || convertedValue < 0) {
                        convertedValue = 0;
                      }

                      if (total + convertedValue > target) {
                        convertedValue = target - total;
                      }

                      field.onChange(convertedValue);
                    }}
                  />
                  {errors.addAmount && (
                    <FieldError data-testid="money-added-error">
                      {errors.addAmount?.message}
                    </FieldError>
                  )}
                  {errors.root?.["server-unprocessable-content"] && (
                    <FieldError data-testid="server-unprocessable-content">
                      {errors.root["server-unprocessable-content"].message}
                    </FieldError>
                  )}
                </>
              )}
            />
          </Field>
          <Button type="submit" variant="cta-primary">
            Confirm Addition
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
