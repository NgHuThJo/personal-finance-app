import styles from "./pot-progress-bar.module.css";
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
            options: numberFormatter.getDollarOptions(),
          })}
        </span>
      </div>
      <div className={styles["card-content-progress"]}>
        <div
          className={styles["card-content-progress-bar"]}
          style={{
            "--width-progress-bar": `${Math.round((total / target) * 100)}%`,
          }}
        ></div>
      </div>
      <div className={styles["card-content-footer"]}>
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
    </div>
  );
}
