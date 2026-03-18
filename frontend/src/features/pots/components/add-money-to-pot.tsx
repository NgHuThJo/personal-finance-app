import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import styles from "./add-money-to-pot.module.css";
import { PotProgressBar } from "#frontend/features/pots/components/pot-progress-bar";
import { clientWithAuth } from "#frontend/shared/api/client";
import type {
  AddMoneyToPotRequest,
  GetAllPotsResponse,
} from "#frontend/shared/client";
import { addMoneyToPotMutation } from "#frontend/shared/client/@tanstack/react-query.gen";
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

export function AddMoneyToPotDialog({ potData }: AddMoneyToPotProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
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
  });
  const { id, total, target, name } = potData;
  const amountToAdd = useWatch({
    name: "moneyAdded",
    defaultValue: 0,
    control,
  });

  const handleAddPotSubmit = handleSubmit((data) => {
    const convertedData: AddMoneyToPotRequest = {
      moneyAdded: 5,
    };

    mutate({
      body: convertedData,
      path: {
        potId: potData.id,
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
          />
          <Field>
            <FieldLabel htmlFor="money-added">Amount to add</FieldLabel>
            <Controller
              name="moneyAdded"
              control={control}
              rules={{
                required: "Amount is required",
                validate: {
                  isNumber: (value) =>
                    !Number.isNaN(value) || "Must be a number",
                  nonNegative: (value) => value >= 0 || "Cannot be negative",
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
                  {errors.moneyAdded && (
                    <FieldError>{errors.moneyAdded?.message}</FieldError>
                  )}
                  {errors.root?.["server-bad-request"] && (
                    <FieldError>
                      {errors.root["server-bad-request"].message}
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
