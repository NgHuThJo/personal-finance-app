import { Button } from "#frontend/components/ui/button/button";
import { Dialog } from "#frontend/components/ui/dialog/dialog";
import { FormError } from "#frontend/components/ui/form/error/error";
import { Input } from "#frontend/components/ui/form/input/input";
import { BudgetCard } from "#frontend/features/budget/components/card/card";
import { BudgetSummary } from "#frontend/features/budget/components/summary/summary";
import { useDialog } from "#frontend/hooks/use-dialog";
import { trpc } from "#frontend/lib/trpc";
import { useUserId } from "#frontend/providers/auth-context";
import { budgetFormSchema, BudgetFormSchemaError } from "#frontend/types/zod";
import { FormEvent, useState } from "react";
import { Close } from "#frontend/components/ui/icon/icon";
import styles from "./budget.module.css";

export function Budget() {
  const utils = trpc.useUtils();
  const [fieldErrors, setFieldErrors] = useState<BudgetFormSchemaError>({});
  const { dialogRef, openDialog, closeDialog } = useDialog();
  const userId = useUserId();
  const {
    data: budgets,
    error,
    isPending,
  } = trpc.budget.getAllBudgets.useQuery({ userId });
  const { data: transactions } = trpc.transaction.getAllTransactions.useQuery({
    userId,
  });
  const createBudget = trpc.budget.createBudget.useMutation();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  const categoryMap: Record<string, []> = {};

  transactions?.forEach((item) => {
    const key = item.category.toLocaleLowerCase();

    if (!categoryMap[key]) {
      categoryMap[key] = [];
    }

    categoryMap[key].push(item);
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      userId,
      ...formData,
    };
    const parsedData = budgetFormSchema.safeParse(payload);

    if (!parsedData.success) {
      setFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    createBudget.mutate(parsedData.data, {
      onSuccess: () => {
        utils.budget.invalidate();
        closeDialog();
      },
      onError: (error) => {
        console.error("Backend error:", error.message);
      },
      onSettled: () => {
        setFieldErrors({});
      },
    });
  };

  return (
    <div className={styles.container}>
      <Dialog ref={dialogRef} className="add-dialog">
        <form method="post" onSubmit={handleSubmit}>
          <div>
            <h2>Add New Budget</h2>
            <Button type="button" onClick={closeDialog}>
              <Close />
            </Button>
          </div>
          <p>
            Choose a category to set a spending budget. These categories can
            help you monitor spending.
          </p>
          <label htmlFor="category">
            <select defaultValue="" name="category" id="category">
              <option value="">Select a category</option>
              <option value="ENTERTAINMENT">Entertainment</option>
              <option value="BILLS">Bills</option>
              <option value="GROCERIES">Groceries</option>
              <option value="TRANSPORTATION">Transportation</option>
              <option value="EDUCATION">Education</option>
              <option value="LIFESTYLE">Lifestyle</option>
              <option value="SHOPPING">Shopping</option>
              <option value="GENERAL">General</option>
            </select>
          </label>
          {fieldErrors.category && (
            <FormError message={fieldErrors?.category} />
          )}
          <Input
            label="Maximum Spend"
            placeholder="e.g. 2000"
            type="number"
            name="amount"
            error={fieldErrors?.amount}
          />
          <Button type="submit" className="add">
            Submit
          </Button>
        </form>
      </Dialog>
      <div className={styles.heading}>
        <h1>Budgets</h1>
        <Button type="button" onClick={openDialog} className="add">
          + Add New Budget
        </Button>
      </div>
      <BudgetSummary budgets={budgets} />
      {budgets?.map((budget, index) => (
        <BudgetCard
          budget={budget}
          key={index}
          transactions={categoryMap[budget.category.toLocaleLowerCase()]}
        />
      ))}
    </div>
  );
}
