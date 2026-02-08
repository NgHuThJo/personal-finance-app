import { Link } from "@tanstack/react-router";
import styles from "./account-summary.module.css";
import { CaretRight } from "#frontend/assets/icons/icons";

// Ensure that key is unique
const options = [
  {
    name: "Pots",
    to: "/pots",
  },
  {
    name: "Transactions",
    to: "/transactions",
  },
  {
    name: "Budgets",
    to: "/budgets",
  },
  {
    name: "Recurring Bills",
    to: "/recurring-bills",
  },
];

export function AccountSummary() {
  return (
    <ul className={styles.layout}>
      {options.map(({ name, to }) => (
        <li className={styles["list-item"]} key={name}>
          <div className={styles["list-item-top"]}>
            <h2>{name}</h2>
            <Link to={to} className={styles.link}>
              See Details
              <CaretRight />
            </Link>
          </div>
          <div>
            <p>No data provided.</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
