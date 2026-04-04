<<<<<<< HEAD
import styles from "./budget-progressbar.module.css";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

type BudgetProgressBarProps = {
  spent: number;
  maximum: number;
};

export function BudgetProgressBar({ maximum, spent }: BudgetProgressBarProps) {
  return (
    <div className={styles["card-content"]}>
      <div className={styles["card-content-header"]}>
        <span className={styles["maximum-label"]}>
          Maximum of &nbsp;
          {numberFormatter.formatNumber({
            number: maximum,
=======
import styles from "./budget-progress-bar.module.css";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

type PotProgressBarProps = {
  description: string;
  total: number;
  target: number;
};

export function PotProgressBar({
  description,
  total,
  target,
}: PotProgressBarProps) {
  return (
    <div className={styles["card-content"]}>
      <div className={styles["card-content-header"]}>
        <span className={styles["total-label"]}>{description}</span>
        <span className={styles["total-number"]}>
          {numberFormatter.formatNumber({
            number: total,
>>>>>>> 76ced0e (feat: create budget card)
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </div>
      <div className={styles["card-content-progress"]}>
        <div
          className={styles["card-content-progress-bar"]}
          style={{
<<<<<<< HEAD
            "--width-progress-bar": `${Math.min(Math.round((spent / maximum) * 100), 100)}%`,
=======
            "--width-progress-bar": `${Math.round((total / target) * 100)}%`,
>>>>>>> 76ced0e (feat: create budget card)
          }}
        ></div>
      </div>
      <div className={styles["card-content-footer"]}>
<<<<<<< HEAD
        <div className={styles["footer-cell"]}>
          <div className={styles["footer-left"]}></div>
          <div className={styles["footer-right"]}>
            <div className={styles["footer-label"]}>Spent</div>
            <div className={styles["footer-number"]}>
              {numberFormatter.formatNumber({
                number: spent,
                options: numberFormatter.getDollarOptions(),
              })}
            </div>
          </div>
        </div>
        <div className={styles["footer-cell"]}>
          <div className={styles["footer-left"]}></div>
          <div className={styles["footer-right"]}>
            <div className={styles["footer-label"]}>Free</div>
            <div className={styles["footer-number"]}>
              {numberFormatter.formatNumber({
                number: maximum - spent,
                options: numberFormatter.getDollarOptions(),
              })}
            </div>
          </div>
        </div>
=======
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
>>>>>>> 76ced0e (feat: create budget card)
      </div>
    </div>
  );
}
