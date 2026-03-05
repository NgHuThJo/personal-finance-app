import { useForm } from "react-hook-form";
import styles from "./withdraw-money.module.css";
import { Logger } from "#frontend/shared/app/logging";
import type { GetAllPotsResponse } from "#frontend/shared/client";
import { Button } from "#frontend/shared/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "#frontend/shared/primitives/dialog";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

type WithdrawMoneyDialogProps = {
  potData: GetAllPotsResponse;
};

export function WithdrawMoneyDialog({ potData }: WithdrawMoneyDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // resolver: zodResolver()
  });
  const { id, name, target, total } = potData;

  const handleWithdrawSubmit = handleSubmit((data) => {
    Logger.info("data in withdrawal", data);
  });

  return (
    <Dialog>
      <DialogTrigger asChild={true}>
        <Button variant="cta-secondary" size="lg">
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogPortal>
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
                type="number"
                id="withdraw-amount"
                className={styles["dialog-input"]}
                {...register("withdraw-amount")}
              />
            </div>
            <Button variant="cta-primary" type="submit">
              Confirm Withdrawal
            </Button>
          </form>
          <DialogClose />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
