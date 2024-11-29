import { useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "#frontend/providers/auth-context";
import { LogoutButton } from "#frontend/features/auth/components/logout/button";
import { NavigationLink } from "./link/link";
import { NavigationList } from "./list/list";
import { NotificationList } from "../notifiication/list";
import { UserDisplay } from "#frontend/features/user/components/display/display";
import styles from "./navigation.module.css";

export function Navigation() {
  const navListRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuthContext();
  const userId = user?.id.toLocaleString();

  const handleNavState = () => {
    navListRef.current?.classList.toggle(styles.flex);
  };

  return (
    <nav className={styles.container}>
      <Link to="/" className={styles.logo}>
        Social media app
      </Link>
      <button className={styles.hamburger} onClick={handleNavState}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={styles.nav} ref={navListRef}>
        {userId && <NavigationList className="header" userId={userId} />}
        <div className={styles["flex-row"]}>
          {!userId ? (
            <>
              <NavigationLink to="/auth/login">Login</NavigationLink>
              <NavigationLink to="/auth/register">Register</NavigationLink>
            </>
          ) : (
            <>
              <UserDisplay />
              <LogoutButton />
              <NotificationList />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
