import { Link } from "@tanstack/react-router";
import styles from "./bottom-summary.module.css";
import { CaretRight } from "#frontend/assets/icons/icons";
import { BottomCardLayout } from "#frontend/features/dashboard/layouts/bottom-card";

export function BottomSummary() {
  return (
    <ul className={styles.layout}>
      <li>
        <BottomCardLayout>
          <h2>Pots</h2>
          <Link to="">
            See Details
            <CaretRight />
          </Link>
        </BottomCardLayout>
      </li>
      <li>
        <BottomCardLayout>
          <h2>Transactions</h2>
          <Link to="">
            See Details
            <CaretRight />
          </Link>
        </BottomCardLayout>
      </li>
      <li>
        <BottomCardLayout>
          <h2>Budgets</h2>
          <Link to="">
            See Details
            <CaretRight />
          </Link>
        </BottomCardLayout>
      </li>
      <li>
        <BottomCardLayout>
          <h2>Recurring Bills</h2>
          <Link to="">
            See Details
            <CaretRight />
          </Link>
        </BottomCardLayout>
      </li>
    </ul>
  );
}
