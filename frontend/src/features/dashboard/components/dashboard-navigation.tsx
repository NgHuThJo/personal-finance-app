import { Link, linkOptions } from "@tanstack/react-router";
import styles from "./dashboard-navigation.module.css";
import {
  ArrowsDownUp,
  ChartDonut,
  House,
  Jar,
  Receipt,
  ShortLogo,
} from "#frontend/assets/icons/icons";

// Note: "to" is used as React key, might consider a different key if "to" is not unique
const iconList = linkOptions([
  {
    to: "/dashboard",
    icon: House,
  },
  {
    to: "/transactions",
    icon: ArrowsDownUp,
  },
  {
    to: "/budget",
    icon: ChartDonut,
  },
  {
    to: "/pots",
    icon: Jar,
  },
  {
    to: "/bills",
    icon: Receipt,
  },
]);

export function DashboardNavigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles["logo-wrapper"]}>
        <ShortLogo />
      </div>
      <div className={styles["nav-list-wrapper"]}>
        {iconList.map(({ to, icon: Icon }) => (
          <Link
            key={to}
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
