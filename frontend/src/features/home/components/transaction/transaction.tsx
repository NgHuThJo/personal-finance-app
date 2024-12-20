import { Link } from "react-router";
import { useUserId } from "#frontend/providers/auth-context";
import { trpc } from "#frontend/lib/trpc";
import { CardLayout } from "#frontend/features/home/components/layouts/card-layout";
import styles from "./transaction.module.css";

export function Transaction() {
  const userId = useUserId();
  const {
    data: transactions,
    isPending,
    error,
  } = trpc.transaction.getAllTransactions.useQuery({ userId });

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <CardLayout className="light">
      <div className={styles.top}>
        <h2>Transactions</h2>
        <Link to="transactions">See details</Link>
      </div>
      {!transactions || !transactions.length ? (
        <p>No transactions.</p>
      ) : (
        <ul>
          {transactions?.map((transaction, index) => (
            <li key={index}>
              <p>
                {transaction.senderId === userId
                  ? transaction.recipient.firstName +
                    " " +
                    transaction.recipient.lastName
                  : transaction.sender.firstName +
                    " " +
                    transaction.sender.lastName}
              </p>
              <p>
                {transaction.senderId === userId ? "-" : "+"}$
                {transaction.transactionAmount}
              </p>
            </li>
          ))}
        </ul>
      )}
    </CardLayout>
  );
}
