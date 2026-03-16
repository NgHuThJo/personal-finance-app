import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import styles from "./withdraw-money.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type {
  GetAllPotsResponse,
  WithdrawMoneyFromPotRequest,
} from "#frontend/shared/client";

import {
  getApiPotsQueryKey,
  putApiPotsMutation,
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
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";
import { makeZodErrorsUserFriendly } from "#frontend/shared/utils/zod";

type WithdrawMoneyDialogProps = {
  potData: GetAllPotsResponse;
};

export function WithdrawMoneyDialog({ potData }: WithdrawMoneyDialogProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WithdrawMoneyFromPotRequest>();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    ...putApiPotsMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Money successfully withdrawn from pot");
      await queryClient.invalidateQueries({ queryKey: getApiPotsQueryKey() });
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
  const { id, name, target, total } = potData;

  const handleWithdrawSubmit = handleSubmit((data) => {
    const convertedData: WithdrawMoneyFromPotRequest = {
      ...data,
      potId: data.potId,
    };

    const validationResult = zWithdrawMoneyFromPotRequest.safeParse(
      convertedData,
      {
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
      },
    );

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
    }

    // const convertedData : WithdrawMoneyFromPotRequest = {
    //   potId: Number(data.potId)
    // }

    // mutate({
    //   body: {
    //     potId: data.potId,
    //     moneyWithdrawn: data.moneyWithdrawn,
    //   },
    // });
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
          <div className={styles["dialog-header"]}>
            <span className={styles["total-label"]}>Total saved</span>
            <span className={styles["total-number"]}>
              {numberFormatter.formatNumber({
                number: total,
                options: numberFormatter.getDollarOptions(),
              })}
            </span>
          </div>
          <div className={styles["dialog-progress"]}>
            <div
              className={styles["dialog-progress-bar"]}
              style={{
                "--width-progress-bar": `${Math.round((total / target) * 100)}%`,
              }}
            ></div>
          </div>
          <div className={styles["dialog-footer"]}>
            <span className={styles["percent-number"]}>
              {numberFormatter.formatNumber({
                number: total / target,
                options: numberFormatter.getPercentOptions(),
              })}
            </span>
            <span className={styles["target-number"]}>
              Target of&nbsp;
              {numberFormatter.formatNumber({
                number: target,
                options: numberFormatter.getDollarOptions(),
              })}
            </span>
          </div>
          <div className={styles["dialog-input-wrapper"]}>
            <label
              htmlFor="withdraw-amount"
              className={styles["dialog-input-label"]}
            >
              Amount to withdraw
            </label>
            <input
              type="hidden"
              {...register("potId", {
                value: id,
              })}
              defaultValue={id}
            />
            <input
              type="number"
              id="withdraw-amount"
              className={styles["dialog-input"]}
              step="any"
              placeholder="Enter an amount to withdraw..."
              {...register("moneyWithdrawn", {
                required: "Amount to withdraw required",
                min: {
                  value: 0.01,
                  message: "Minimum of 0.01",
                },
                max: {
                  value: total,
                  message: `Maximum of ${total}`,
                },
                valueAsNumber: true,
              })}
            />
            {errors.moneyWithdrawn && (
              <span className={styles["field-error"]}>
                {errors.moneyWithdrawn?.message}
              </span>
            )}
            {errors.root?.["server-unprocessable-content"] && (
              <span
                className={styles["field-error"]}
                data-testid="server-unprocessable-content"
              >
                {errors.root?.["server-unprocessable-content"]?.message}
              </span>
            )}
          </div>
          <Button variant="cta-primary" type="submit">
            Confirm Withdrawal
          </Button>
        </form>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
