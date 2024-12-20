import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";
import { Button } from "#frontend/components/ui/button/button";

export function Budget() {
  const userId = useUserId();
  const {
    data: budgets,
    error,
    isPending,
  } = trpc.budget.getAllBudgets.useQuery({ userId });

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div>
      <div>
        <h1>Budgets</h1>
        <Button type="button">+ Add New Budget</Button>
      </div>
      <div>
        <div></div>
        <div>
          <h2>Spending Summary</h2>
          <ul>
            {budgets?.map((budget, index) => (
              <li key={index}>
                <span>{budget.category}</span>
                <p>
                  <span>${budget.spentAmount}</span> of ${budget.maxAmount}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
