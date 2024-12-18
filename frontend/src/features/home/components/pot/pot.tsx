import { Link } from "react-router-dom";
import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";
import { CardLayout } from "#frontend/features/home/components/layouts/card-layout";
import styles from "./pot.module.css";
import { Jar } from "#frontend/components/ui/icon/icon";

export function Pot() {
  const userId = useUserId();
  const {
    data: pots,
    isPending,
    isError,
    error,
  } = trpc.pot.getAllPots.useQuery({ userId });

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  const totalSavings =
    pots?.reduce((total, { totalAmount, savedAmount }) => {
      const totalAmountNum = Number(totalAmount) || 0;
      const savedAmountNum = Number(savedAmount) || 0;
      return total + (totalAmountNum - savedAmountNum);
    }, 0) ?? 0;

  return (
    <CardLayout className="light">
      <div className={styles.top}>
        <h2>Pots</h2>
        <Link to="pots">See Details</Link>
      </div>
      <div className={styles.total}>
        <Jar />
        <div>
          <h3>Pots</h3>
          <p>${totalSavings.toFixed(2)}</p>
        </div>
      </div>
    </CardLayout>
  );
}
