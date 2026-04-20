import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import styles from "./withdraw-money.module.css";
import { PotProgressBar } from "#frontend/features/pots/components/pot-progress-bar";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type {
  GetAllPotsResponse,
  WithdrawMoneyFromPotRequest,
} from "#frontend/shared/client";

import {
  getAllPotsQueryKey,
  withdrawMoneyFromPotMutation,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { zWithdrawMoneyFromPotRequest } from "#frontend/shared/client/zod.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  Dialog,
  DialogClose,
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
import { makeZodErrorsUserFriendly } from "#frontend/shared/utils/zod";

type WithdrawMoneyDialogProps = {
  potData: GetAllPotsResponse;
};

export function WithdrawMoneyDialog({
  potData: { id, name, target, total, themeColor },
}: WithdrawMoneyDialogProps) {
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<WithdrawMoneyFromPotRequest>();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    ...withdrawMoneyFromPotMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Money successfully withdrawn from pot");
      await queryClient.invalidateQueries({ queryKey: getAllPotsQueryKey() });
      reset();
    },
    onError: (error) => {
      Logger.info("Money could not be withdrawn", error);

      switch (error.status) {
        case 422: {
          setError(`root.server-unprocessable-content`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        default: {
          Logger.error(`Unknown error in ${WithdrawMoneyDialog.name}`);
        }
      }
    },
  });
  const draftAmount = useWatch({
    control,
    name: "withdrawAmount",
    defaultValue: 0,
  });

  const handleWithdrawSubmit = handleSubmit((data) => {
    const validationResult = zWithdrawMoneyFromPotRequest.safeParse(data, {
      error: (iss) => {
        if (iss.code === "invalid_type") {
          return `Invalid type expected ${iss.expected}`;
        }
        if (iss.code === "too_small") {
          return `Minimum is ${iss.minimum}`;
        }
        if (iss.code === "too_big") {
          return `Maximum is ${iss.maximum}`;
        }
      },
    });

    if (!validationResult.success) {
      const userFriendlyErrors = makeZodErrorsUserFriendly(
        validationResult.error,
      );

      for (const error in userFriendlyErrors) {
        const convertedError = error as keyof typeof userFriendlyErrors;

        userFriendlyErrors[convertedError].forEach((errorMessage) => {
          setError(convertedError, {
            message: errorMessage,
          });
        });
      }

      return;
    }

    mutate({
      body: validationResult.data,
      path: {
        potId: id,
      },
    });
  });

  return (
    <Dialog>
      <DialogTrigger asChild={true}>
        <Button variant="cta-secondary" size="lg">
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent variant="default">
        <DialogTitle>Withdraw from "{name}"</DialogTitle>
        <DialogDescription>
          Withdraw from your pot to put money back in your main balance. This
          will reduce the amount you have in this pot.
        </DialogDescription>
        <form className={styles["dialog"]} onSubmit={handleWithdrawSubmit}>
          <PotProgressBar
            description="New Amount"
            total={total - draftAmount}
            target={target}
            themeColor={themeColor}
          />
          <Field>
            <FieldLabel htmlFor="withdraw-amount">
              Amount to withdraw
            </FieldLabel>
            <Controller
              control={control}
              name="withdrawAmount"
              defaultValue={0}
              rules={{
                required: "Amount is required",
                validate: {
                  isNumber: (value) =>
                    !Number.isNaN(value) || "Must be a number",
                  positive: (value) => value > 0 || "Must be greater 0",
                  withinTotal: (value) =>
                    value <= total || `Max is ${total - value}`,
                },
              }}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    type="number"
                    id="withdraw-amount"
                    step="any"
                    placeholder="Enter an amount to withdraw..."
                    onChange={(e) => {
                      let convertedValue = e.currentTarget.valueAsNumber;

                      if (Number.isNaN(convertedValue) || convertedValue < 0) {
                        convertedValue = 0;
                      }

                      if (convertedValue > total) {
                        convertedValue = total;
                      }

                      field.onChange(convertedValue);
                    }}
                  />
                  {errors.withdrawAmount && (
                    <FieldError data-testid="withdraw-money-error">
                      {errors.withdrawAmount?.message}
                    </FieldError>
                  )}
                  {errors.root?.["server-unprocessable-content"] && (
                    <FieldError data-testid="server-unprocessable-content">
                      {errors.root?.["server-unprocessable-content"]?.message}
                    </FieldError>
                  )}
                </>
              )}
            ></Controller>
          </Field>
          <Button variant="cta-primary" type="submit">
            Confirm Withdrawal
          </Button>
        </form>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
