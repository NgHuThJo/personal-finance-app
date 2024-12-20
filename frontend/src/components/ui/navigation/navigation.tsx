import { Link } from "react-router";
import {
  House,
  ArrowsDownUp,
  ChartDonut,
  Jar,
  Receipt,
} from "#frontend/components/ui/icon/icon";
import styles from "./navigation.module.css";

const navList = [
  {
    element: House,
    to: "/app",
  },
  {
    element: ArrowsDownUp,
    to: "transactions",
  },
  {
    element: ChartDonut,
    to: "budgets",
  },
  {
    element: Jar,
    to: "pots",
  },
  {
    element: Receipt,
    to: "bills",
  },
];

export function Navigation() {
  return (
    <nav className={styles.container}>
      {navList.map(({ element: Icon, to }, index) => (
        <Link to={to} key={index}>
          <Icon />
        </Link>
      ))}
    </nav>
  );
}
