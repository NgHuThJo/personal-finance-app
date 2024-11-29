import { NavLink, NavLinkProps } from "react-router-dom";
import styles from "./link.module.css";

export function NavigationLink({ children, to }: NavLinkProps) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive, isPending, isTransitioning }) =>
        [
          isActive ? styles.active : "",
          isPending ? styles.pending : "",
          isTransitioning ? styles.transitioning : "",
        ]
          .join(" ")
          .trim()
      }
    >
      {children}
    </NavLink>
  );
}
