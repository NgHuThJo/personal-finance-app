import { FormEvent, useState } from "react";
import { useDialog } from "#frontend/hooks/use-dialog";
import { trpc } from "#frontend/lib/trpc";
import { formatNumber } from "#frontend/utils/internationalization/intl";
import { PotQueryOutput } from "#frontend/types/trpc";
import { Button } from "#frontend/components/ui/button/button";
import { Dialog } from "#frontend/components/ui/dialog/dialog";
import { Input } from "#frontend/components/ui/form/input/input";
import { Close, Dots } from "#frontend/components/ui/icon/icon";
import styles from "./card.module.css";
import { potAddFormSchema, PotAddFormSchemaError } from "#frontend/types/zod";

type PotCardProps = {
  pot: PotQueryOutput;
};

export function PotCard({ pot }: PotCardProps) {
  const [addFieldErrors, setAddFieldErrors] = useState<PotAddFormSchemaError>(
    {},
  );
  const [withdrawFieldErrors, setWithdrawFieldErrors] =
    useState<PotAddFormSchemaError>({});
  const { dialogRef, openDialog, closeDialog } = useDialog();
  const {
    dialogRef: addDialogRef,
    openDialog: openAddDialog,
    closeDialog: closeAddDialog,
  } = useDialog();
  const {
    dialogRef: withdrawDialogRef,
    openDialog: openWithdrawDialog,
    closeDialog: closeWithdrawDialog,
  } = useDialog();
  const utils = trpc.useUtils();
  const deletePot = trpc.pot.deletePot.useMutation();
  const updatePot = trpc.pot.updatePot.useMutation();

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

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      ...formData,
      id: pot.id,
    };
    const parsedData = potAddFormSchema.safeParse(payload);

    if (!parsedData.success) {
      setAddFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    if (
      parsedData.data.savedAmount >
      Number(pot.totalAmount) - Number(pot.savedAmount)
    ) {
      parsedData.data.savedAmount = Number(pot.totalAmount);
    } else {
      parsedData.data.savedAmount += Number(pot.savedAmount);
    }

    updatePot.mutate(parsedData.data, {
      onSuccess: () => {
        utils.pot.getAllPots.invalidate();
      },
      onError: (error) => {
        console.error(error.message);
      },
    });
  };

  const handleWithdraw = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      ...formData,
      id: pot.id,
    };
    const parsedData = potAddFormSchema.safeParse(payload);

    if (!parsedData.success) {
      setWithdrawFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    if (parsedData.data.savedAmount > Number(pot.savedAmount)) {
      parsedData.data.savedAmount = 0;
    } else {
      parsedData.data.savedAmount =
        Number(pot.savedAmount) - parsedData.data.savedAmount;
    }

    console.log("parsed data in withdraw", parsedData.data);

    updatePot.mutate(parsedData.data, {
      onSuccess: () => {
        utils.pot.getAllPots.invalidate();
      },
      onError: (error) => {
        console.error(error.message);
      },
    });
  };

  return (
    <>
      <Dialog ref={addDialogRef} className="pot-dialog">
        <form method="post" onSubmit={handleAdd}>
          <div>
            <h2>Add to {pot.name}</h2>
            <button type="button" onClick={closeAddDialog}>
              <Close />
            </button>
          </div>
          <p>
            Add money to your pot to keep it separate from your main balance. As
            soon as you add this money, it will be deducted from your current
            balance.
          </p>
          <div>
            <div>
              <span>New Amount</span>
              <span>${pot.savedAmount}</span>
            </div>
            <div>
              <div></div>
            </div>
            <div>
              <span>{`${((Number(pot.savedAmount) / Number(pot.totalAmount)) * 100).toFixed(2)}%`}</span>
              <span>Target of {pot.totalAmount}</span>
            </div>
          </div>
          <Input
            label="Amount to Add"
            name="savedAmount"
            type="number"
            placeholder="Enter amount"
            error={addFieldErrors.savedAmount}
          />
          <Button type="submit" className="add">
            Confirm Addition
          </Button>
          {updatePot.isSuccess && <p data-success>Pot updated.</p>}
        </form>
      </Dialog>
      <Dialog ref={withdrawDialogRef} className="pot-dialog">
        <form method="post" onSubmit={handleWithdraw}>
          <div>
            <h2>Withdraw from {pot.name}</h2>
            <button type="button" onClick={closeWithdrawDialog}>
              <Close />
            </button>
          </div>
          <p>
            Withdraw from your pot to put money back in your main balance. This
            will reduce the amount you have in this pot.
          </p>
          <div>
            <div>
              <span>New Amount</span>
              <span>${pot.savedAmount}</span>
            </div>
            <div>
              <div></div>
            </div>
            <div>
              <span>{`${((Number(pot.savedAmount) / Number(pot.totalAmount)) * 100).toFixed(2)}%`}</span>
              <span>Target of {pot.totalAmount}</span>
            </div>
            <Input
              label="Amount to Withdraw"
              type="number"
              name="savedAmount"
              placeholder="Enter amount"
              error={withdrawFieldErrors.savedAmount}
            />
            <Button type="submit" className="add">
              Confirm Withdrawal
            </Button>
            {updatePot.isSuccess && <p data-success>Pot updated.</p>}
          </div>
        </form>
      </Dialog>
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
          <span>Total Saved</span>
          <span>{`$${formatNumber(Number(pot.savedAmount), {
            opts: {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          })}`}</span>
        </div>
        <div className={styles.bar}>
          <div></div>
        </div>
        <div className={styles.percent}>
          <span>{`${((Number(pot.savedAmount) / Number(pot.totalAmount)) * 100).toFixed(2)}%`}</span>
          <span>Target of ${pot.totalAmount}</span>
        </div>
        <div className={styles.buttons}>
          <Button type="button" className="action" onClick={openAddDialog}>
            +Add Money
          </Button>
          <Button type="button" className="action" onClick={openWithdrawDialog}>
            Withdraw
          </Button>
        </div>
      </li>
    </>
  );
}
