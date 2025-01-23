import { FormEvent, useState } from "react";
import { useUserId } from "#frontend/providers/auth-context";
import { useDialog } from "#frontend/hooks/use-dialog";
import { trpc } from "#frontend/lib/trpc";
import { Button } from "#frontend/components/ui/button/button";
import { Dialog } from "#frontend/components/ui/dialog/dialog";
import { Input } from "#frontend/components/ui/form/input/input";
import { PotCard } from "#frontend/features/pot/components/card/card";
import { Close } from "#frontend/components/ui/icon/icon";
import { potFormSchema, PotFormSchemaError } from "#frontend/types/zod";
import styles from "./pot.module.css";

export function Pot() {
  const utils = trpc.useUtils();
  const [fieldErrors, setFieldErrors] = useState<PotFormSchemaError>({});
  const { dialogRef, openDialog, closeDialog } = useDialog();
  const userId = useUserId();
  const {
    data: pots,
    error,
    isPending,
  } = trpc.pot.getAllPots.useQuery({ userId });
  const createPot = trpc.pot.createPot.useMutation();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      ...formData,
      userId,
    };

    const parsedData = potFormSchema.safeParse(payload);

    if (!parsedData.success) {
      setFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    createPot.mutate(parsedData.data, {
      onSuccess: () => {
        utils.pot.getAllPots.invalidate();
      },
      onError: (error) => {
        console.error(error.message);
      },
    });
  };

  return (
    <div className={styles.container}>
      <Dialog ref={dialogRef} className="add-dialog">
        <form method="post" onSubmit={handleSubmit}>
          <div>
            <h2>Add New Pot</h2>
            <Button type="button" onClick={closeDialog}>
              <Close />
            </Button>
          </div>
          <p>Create a new pot to keep track of your spendings.</p>
          <Input
            type="text"
            placeholder="e.g. Rainy Days"
            name="name"
            label="Pot Name"
            error={fieldErrors?.name}
          />
          <Input
            type="number"
            placeholder="e.g. 2000"
            name="totalAmount"
            label="Target Amount"
            error={fieldErrors?.totalAmount}
          />
          <Button type="submit" className="add">
            Submit
          </Button>
        </form>
      </Dialog>
      <div className={styles.heading}>
        <h1>Pots</h1>
        <Button type="button" onClick={openDialog} className="add">
          +Add New Pot
        </Button>
      </div>
      {!pots?.length ? (
        <p>No pots.</p>
      ) : (
        <ul>{pots?.map((pot, index) => <PotCard pot={pot} key={index} />)}</ul>
      )}
    </div>
  );
}
