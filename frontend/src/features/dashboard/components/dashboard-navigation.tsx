import { Link, linkOptions } from "@tanstack/react-router";
import styles from "./dashboard-navigation.module.css";
import {
  ArrowFatLinesLeft,
  ArrowsDownUp,
  ChartDonut,
  House,
  Jar,
  Logo,
  Receipt,
  ShortLogo,
} from "#frontend/assets/icons/icons";
import { useToggle } from "#frontend/shared/hooks/use-toggle";
import { appLinkOptions } from "#frontend/shared/router/options/linkOptions";

// Note: "to" is used as React key, might consider a different key if "to" is not unique
const iconList = linkOptions([
  {
    to: "/dashboard",
    label: "Home",
    icon: House,
  },
  {
    ...appLinkOptions.getTransactionLinkOptions(),
    label: "Transactions",
    icon: ArrowsDownUp,
  },
  {
    to: "/budgets",
    label: "Budgets",
    icon: ChartDonut,
  },
  {
    to: "/pots",
    label: "Pots",
    icon: Jar,
  },
  {
    ...appLinkOptions.getBillsOptions(),
    label: "Bills",
    icon: Receipt,
  },
]);

export function DashboardNavigation() {
  const { isOpen, toggle } = useToggle(false);

  return (
    <nav className={`${styles.nav} ${!isOpen && styles["shrinking"]}`}>
      <div className={styles["logo-wrapper"]}>
        {isOpen ? <Logo /> : <ShortLogo />}
      </div>
      <div className={styles["nav-list-wrapper"]}>
        {iconList.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`${styles["nav-link"]} ${!isOpen && styles["collapsed"]}`}
            activeProps={{
              className: styles["nav-link-active"],
            }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={
                    isActive
                      ? styles["nav-icon-active"]
                      : styles["nav-icon-inactive"]
                  }
                />
                <span
                  className={`${styles["nav-label"]} ${!isOpen && styles["hidden"]}
                      ${
                        isActive
                          ? styles["nav-label-active"]
                          : styles["nav-label-inactive"]
                      } 
                      `}
                >
                  {label}
                </span>
              </>
            )}
          </Link>
        ))}
      </div>
      <div className={styles["nav-minimizer"]}>
        <button
          className={`${styles["nav-minimizer-button"]} ${!isOpen && styles["collapsed"]}`}
          onClick={toggle}
        >
          <ArrowFatLinesLeft
            style={{
              transform: isOpen ? "rotate(0deg)" : undefined,
            }}
          />
          <span
            className={`${styles["nav-minimizer-text"]} ${!isOpen && styles["hidden"]}`}
          >
            Minimize menu
          </span>
        </button>
      </div>
    </nav>
  );
}
