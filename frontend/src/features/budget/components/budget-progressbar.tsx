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
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </div>
      <div className={styles["card-content-progress"]}>
        <div
          className={styles["card-content-progress-bar"]}
          style={{
            "--width-progress-bar": `${Math.min(Math.round((spent / maximum) * 100), 100)}%`,
          }}
        ></div>
      </div>
      <div className={styles["card-content-footer"]}>
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
      </div>
    </div>
  );
}
