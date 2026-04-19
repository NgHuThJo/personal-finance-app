import styles from "./pot-progress-bar.module.css";
import type { ThemeColor } from "#frontend/shared/client";
import { getColorHexCode } from "#frontend/shared/utils/color";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

type PotProgressBarProps = {
  description: string;
  total: number;
  target: number;
  themeColor: ThemeColor;
};

export function PotProgressBar({
  description,
  total,
  target,
  themeColor,
}: PotProgressBarProps) {
  const hexColor = getColorHexCode(themeColor);

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
            "--color-background-progressbar": `${hexColor}`,
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
