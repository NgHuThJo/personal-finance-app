import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import styles from "./pot-summary.module.css";
import { CaretRight, JarLight } from "#frontend/assets/icons/icons";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllPotsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { appLinkOptions } from "#frontend/shared/router/options/linkOptions";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

export function DashboardPotsSummary() {
  const { data: potsData } = useSuspenseQuery({
    ...getAllPotsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });

  const targetSum = potsData.reduce((acc, curr) => {
    return acc + curr.target;
  }, 0);
  const highestPotTargets = potsData
    .sort((a, b) => b.target - a.target)
    .slice(0, 4);

  return (
    <div className={styles.layout}>
      <div className={styles["header"]}>
        <h2>Pots</h2>
        <Link {...appLinkOptions.getPotsOptions()} className={styles.link}>
          See Details
          <CaretRight />
        </Link>
      </div>
      <div className={styles["summary"]}>
        <div className={styles["sum-layout"]}>
          <JarLight />
          <div className={styles["total-sum-layout"]}>
            <span className={styles["label"]}>Pots</span>
            <span className={styles["total"]}>
              {numberFormatter.formatNumber({
                number: targetSum,
                options: numberFormatter.getDollarOptions(),
              })}
            </span>
          </div>
        </div>
        <ul className={styles["list"]}>
          {highestPotTargets.map((pot) => (
            <li className={styles["list-item"]}>
              <div className={styles["list-value"]}>
                <span className={styles["name"]}>{pot.name}</span>
                <span className={styles["target"]}>
                  {numberFormatter.formatNumber({
                    number: pot.target,
                    options: numberFormatter.getDollarOptions(),
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
