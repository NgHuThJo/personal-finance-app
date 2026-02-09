import { Link } from "@tanstack/react-router";
import styles from "./dashboard-navigation.module.css";
import {
  ArrowsDownUp,
  ChartDonut,
  House,
  Jar,
  Receipt,
  ShortLogo,
} from "#frontend/assets/icons/icons";

const iconList = [
  {
    to: "/dashboard",
    icon: House,
  },
  {
    to: "/dashboard/transactions",
    icon: ArrowsDownUp,
  },
  {
    to: "/dashboard/budget",
    icon: ChartDonut,
  },
  {
    to: "/dashboard/pots",
    icon: Jar,
  },
  {
    to: "/dashboard/bills",
    icon: Receipt,
  },
];

export function DashboardNavigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles["logo-wrapper"]}>
        <ShortLogo />
      </div>
      <div className={styles["nav-list-wrapper"]}>
        {iconList.map(({ to, icon: Icon }) => (
          <Link
            to={to}
            className={styles["nav-link"]}
            activeProps={{
              className: styles["nav-link-active"],
            }}
            activeOptions={{
              exact: true,
            }}
          >
            {({ isActive }) => (
              <Icon
                className={
                  isActive
                    ? styles["nav-icon-active"]
                    : styles["nav-icon-inactive"]
                }
              />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
