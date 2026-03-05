import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./board.module.css";
import { Dots } from "#frontend/assets/icons/icons";
import { WithdrawMoneyDialog } from "#frontend/features/pots/components/withdraw-money-dialog";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getApiPotsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";

export function PotsBoard() {
  const { data } = useSuspenseQuery({
    ...getApiPotsOptions({
      client: clientWithAuth,
    }),
  });

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Pots</h1>
        <Button variant="cta-primary" size="lg">
          +Add New Pot
        </Button>
      </header>
      <ul className={styles.body}>
        {data.map((pot) => (
          <li key={pot.id} className={styles.card}>
            <header className={styles["card-header"]}>
              <h2 className={styles["card-heading"]}>{pot.name}</h2>
              <Button variant="icon">
                <Dots />
              </Button>
            </header>
            <div className={styles["card-content"]}>
              <div className={styles["card-content-header"]}>
                <span className={styles["total-label"]}>Total saved</span>
                <span className={styles["total-number"]}>
                  {numberFormatter.formatNumber({
                    number: pot.total,
                    options: numberFormatter.getDollarOptions(),
                  })}
                </span>
              </div>
              <div className={styles["card-content-progress"]}>
                <div
                  className={styles["card-content-progress-bar"]}
                  style={{
                    "--width-progress-bar": `${Math.round((pot.total / pot.target) * 100)}%`,
                  }}
                ></div>
              </div>
              <div className={styles["card-content-footer"]}>
                <span className={styles["percent-number"]}>
                  {numberFormatter.formatNumber({
                    number: pot.total / pot.target,
                    options: numberFormatter.getPercentOptions(),
                  })}
                </span>
                <span className={styles["target-number"]}>
                  Target of&nbsp;
                  {numberFormatter.formatNumber({
                    number: pot.target,
                    options: numberFormatter.getDollarOptions(),
                  })}
                </span>
              </div>
            </div>
            <div className={styles["card-footer"]}>
              <Button variant="cta-secondary" size="lg">
                +Add Money
              </Button>
              <WithdrawMoneyDialog potData={pot} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
