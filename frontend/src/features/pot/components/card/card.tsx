import { useDialog } from "#frontend/hooks/use-dialog";
import { trpc } from "#frontend/lib/trpc";
import { formatNumber } from "#frontend/utils/internationalization/intl";
import { PotQueryOutput } from "#frontend/types/trpc";
import { Button } from "#frontend/components/ui/button/button";
import { Dialog } from "#frontend/components/ui/dialog/dialog";
import { Dots } from "#frontend/components/ui/icon/icon";
import styles from "./card.module.css";

type PotCardProps = {
  pot: PotQueryOutput;
};

export function PotCard({ pot }: PotCardProps) {
  const { dialogRef, openDialog, closeDialog } = useDialog();
  const utils = trpc.useUtils();
  const deletePot = trpc.pot.deletePot.useMutation();

  const handleDelete = (id: number) => {
    deletePot.mutate(
      { id },
      {
        onSuccess: () => {
          utils.pot.getAllPots.invalidate();
        },
        onError: (error) => {
          console.error(error.message);
        },
      },
    );
  };

  return (
    <>
      <Dialog ref={dialogRef} className="delete">
        <h2>Delete {pot.name}?</h2>
        <p>
          Are you sure you want to delete this pot? This action cannot be
          reversed, and all the data inside it will be removed forever.
        </p>
        <div>
          <Button type="button" onClick={() => handleDelete(pot.id)}>
            Yes, Confirm Deletion
          </Button>
          <Button type="button" onClick={closeDialog}>
            Close
          </Button>
        </div>
      </Dialog>
      <li className={styles.container}>
        <div className={styles.heading}>
          <h2>{pot.name}</h2>
          <Button type="button" onClick={openDialog}>
            <Dots />
          </Button>
        </div>
        <div className={styles.middle}>
          <div>Total Saved</div>
          <div>{`$${formatNumber(Number(pot.savedAmount), {
            opts: {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          })}`}</div>
        </div>
        <div className={styles.bar}>
          <div></div>
        </div>
        <div className={styles.percent}>
          <span>
            {(Number(pot.savedAmount) / Number(pot.totalAmount)) * 100}%
          </span>
          <span>Target of ${pot.totalAmount}</span>
        </div>
        <div className={styles.buttons}>
          <Button type="button" className="action">
            +Add Money
          </Button>
          <Button type="button" className="action">
            Withdraw
          </Button>
        </div>
      </li>
    </>
  );
}
