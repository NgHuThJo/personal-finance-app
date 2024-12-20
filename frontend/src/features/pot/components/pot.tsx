import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";

export function Pot() {
  const userId = useUserId();
  const {
    data: pots,
    error,
    isPending,
  } = trpc.pot.getAllPots.useQuery({ userId });

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div>
      <div>
        <h1>Pots</h1>
      </div>
      <ul>
        {pots?.map((pot, index) => (
          <li key={index}>
            <h2>{pot.name}</h2>
            <div>
              <div>Total Saved</div>
              <div>${pot.savedAmount}</div>
            </div>
            <div>
              <div>${pot.totalAmount}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
