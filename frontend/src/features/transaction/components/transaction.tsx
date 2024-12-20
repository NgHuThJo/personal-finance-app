import { useUserId } from "#frontend/providers/auth-context";
import { useDialog } from "#frontend/hooks/use-dialog";
import { trpc } from "#frontend/lib/trpc";
import { Button } from "#frontend/components/ui/button/button";
import { Dialog } from "#frontend/components/ui/dialog/dialog";
import { formatDate } from "#frontend/utils/intl";
import { capitalizeFirstLetter } from "#frontend/utils/string";

export function Transaction() {
  const { dialogRef, openDialog, closeDialog } = useDialog();
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
    <div>
      <Dialog ref={dialogRef}>
        <Button type="submit" onClick={closeDialog}>
          Submit
        </Button>
      </Dialog>
      <div>
        <h1>Transactions</h1>
        <Button onClick={openDialog}>+ Add New Transaction</Button>
      </div>
      <div>
        {transactions?.length ? (
          <table>
            <thead>
              <tr>
                <th>Recipient/Sender</th>
                <th>Category</th>
                <th>Transaction Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    {transaction.recipientId === userId
                      ? transaction.sender.firstName +
                        " " +
                        transaction.sender.lastName
                      : transaction.recipient.firstName +
                        " " +
                        transaction.recipient.lastName}
                  </td>
                  <td>
                    {capitalizeFirstLetter(transaction.category.toLowerCase())}
                  </td>
                  <td>{formatDate(new Date(transaction.createdAt))}</td>
                  <td>
                    {transaction.senderId === userId ? "-" : "+"}$
                    {transaction.transactionAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions</p>
        )}
      </div>
    </div>
  );
}
