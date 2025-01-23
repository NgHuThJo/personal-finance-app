import { Link } from "react-router";
import { trpc } from "#frontend/lib/trpc";
import { useUserId } from "#frontend/providers/auth-context";
import { useDialog } from "#frontend/hooks/use-dialog";
import { Button } from "#frontend/components/ui/button/button";
import { Dialog } from "#frontend/components/ui/dialog/dialog";
import { getFullName } from "#frontend/domain/user";
import {
  formatDate,
  formatNumber,
} from "#frontend/utils/internationalization/intl";
import { capitalizeFirstLetter } from "#frontend/utils/primitives/string";
import {
  BudgetQueryOutput,
  TransactionQueryOutput,
} from "#frontend/types/trpc";
import { CaretRight, Dots } from "#frontend/components/ui/icon/icon";
import styles from "./card.module.css";

type BudgetCardProps = {
  budget: BudgetQueryOutput;
  transactions: TransactionQueryOutput[] | undefined;
};

export function BudgetCard({ budget, transactions }: BudgetCardProps) {
  const { dialogRef, openDialog, closeDialog } = useDialog();
  const userId = useUserId();
  const utils = trpc.useUtils();
  const deleteBudget = trpc.budget.deleteBudget.useMutation();

  const handleDelete = (category: string) => {
    const payload = {
      userId,
      category,
    };

    deleteBudget.mutate(payload, {
      onSuccess: () => {
        utils.budget.getAllBudgets.invalidate();
      },
      onError: (error) => {
        console.log("Backend error:", error.message);
      },
    });
  };

  const filteredTransactions = transactions?.filter(
    (item) => userId === item.senderId,
  );

  return (
    <div className={styles.card}>
      <Dialog ref={dialogRef} className="delete">
        <h2>Delete {capitalizeFirstLetter(budget.category)}?</h2>
        <p>
          Are you sure you want to delete this budget? This action cannot be
          reversed, and all the data inside it will be removed forever.
        </p>
        <div>
          <Button type="button" onClick={() => handleDelete(budget.category)}>
            Yes, Confirm Deletion
          </Button>
          <Button type="button" onClick={closeDialog}>
            No, Go Back
          </Button>
        </div>
      </Dialog>
      <div className={styles.heading}>
        <h2>{capitalizeFirstLetter(budget.category)}</h2>
        <Button type="button" onClick={openDialog}>
          <Dots />
        </Button>
      </div>
      <p>
        Maximum of $
        {formatNumber(Number(budget.maxAmount), {
          opts: {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        })}
      </p>
      <div className={styles["status-bar"]}>
        <div
          style={{
            width: `${Number(budget.spentAmount) / Number(budget.maxAmount)}%`,
          }}
        ></div>
      </div>
      <div className={styles.summary}>
        <div>
          <span>Spent</span>
          <span>
            $
            {formatNumber(Number(budget.spentAmount), {
              opts: {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            })}
          </span>
        </div>
        <div>
          <span>Free</span>
          <span>
            $
            {formatNumber(
              Number(budget.maxAmount) - Number(budget.spentAmount),
              {
                opts: {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              },
            )}
          </span>
        </div>
      </div>
      <div className={styles.transactions}>
        <div>
          <h3>Latest Spending</h3>
          <Link to="/app/transactions">
            See All <CaretRight />
          </Link>
        </div>
        {!filteredTransactions?.length ? (
          <p>You haven't made any spendings yet.</p>
        ) : (
          <ul>
            {filteredTransactions?.map((item) => {
              return (
                <li key={item.id} className={styles.transaction}>
                  <span>
                    {getFullName({
                      firstName: item.recipient.firstName,
                      lastName: item.recipient.lastName,
                    })}
                  </span>
                  <div>
                    <span>{`-$${formatNumber(Number(item.transactionAmount), {
                      opts: {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    })}`}</span>
                    <span>{formatDate(new Date(item.createdAt))}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
