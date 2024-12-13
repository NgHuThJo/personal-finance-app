import { useNavigate } from "react-router-dom";
import { useAuthStore } from "#frontend/providers/auth-context";
import { Balance } from "#frontend/features/home/components/balance/balance";
import { Button } from "#frontend/components/ui/button/button";
import { Logout } from "#frontend/components/ui/icon/icon";
import { Pot } from "#frontend/features/home/components/pot/pot";

export function Home() {
  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const handleLogout = () => {
    logoutUser();

    return navigate("/");
  };

  return (
    <main>
      <div>
        <h1>Overview</h1>
        <Button type="button" onClick={handleLogout}>
          <Logout />
          Logout
        </Button>
      </div>
      <Balance />
      <Pot />
    </main>
  );
}
