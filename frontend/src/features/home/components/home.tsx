import { useNavigate } from "react-router";
import { useAuthStore } from "#frontend/providers/auth-context";
import { Balance } from "#frontend/features/home/components/balance/balance";
import { Budget } from "#frontend/features/home/components/budget/budget";
import { Button } from "#frontend/components/ui/button/button";
import { Logout } from "#frontend/components/ui/icon/icon";
import { Pot } from "#frontend/features/home/components/pot/pot";
import { Transaction } from "#frontend/features/home/components/transaction/transaction";
import styles from "./home.module.css";

export function Home() {
  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const handleLogout = () => {
    logoutUser();

    return navigate("/");
  };

  return (
    <main className={styles.container}>
      <div className={styles.top}>
        <h1>Overview</h1>
        <Button type="button" onClick={handleLogout}>
          <Logout />
          Logout
        </Button>
      </div>
      <Balance />
      <Pot />
      <Transaction />
      <Budget />
    </main>
  );
}
