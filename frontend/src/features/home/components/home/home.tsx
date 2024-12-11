import { useNavigate } from "react-router-dom";
import { useAuthStore, useUserId } from "#frontend/providers/auth-context";
import { Button } from "#frontend/components/ui/button/button";
import { Logout } from "#frontend/components/ui/icon/icon";
import { trpc } from "#frontend/lib/trpc";

export function Home() {
  const navigate = useNavigate();
  const userId = useUserId();
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const balance = trpc.account.getBalance.useQuery({ userId });
  const income = balance.data?.income;
  const expense = balance.data?.expense;

  const handleLogout = () => {
    logoutUser();

    return navigate("/");
  };

  if (balance.isPending) {
    return <p>Loading...</p>;
  }

  if (balance.isError) {
    return <p>{balance.error.message}</p>;
  }

  return (
    <main>
      <div>
        <h1>Overview</h1>
        <Button type="button" onClick={handleLogout}>
          <Logout />
          Logout
        </Button>
      </div>
      <div>
        <div>
          <h2>Current balance</h2>
          <span>
            $
            {income && expense
              ? (income - expense).toFixed(2)
              : Number(0).toFixed(2)}
          </span>
        </div>
        <div>
          <h2>Income</h2>
          <span>${Number(income ?? 0).toFixed(2)}</span>
        </div>
        <div>
          <h2>Expenses</h2>
          <span>${Number(expense ?? 0).toFixed(2)}</span>
        </div>
      </div>
    </main>
  );
}
