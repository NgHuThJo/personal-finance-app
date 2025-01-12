import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { useUserId } from "#frontend/providers/auth-context";
import { useDialog } from "#frontend/hooks/use-dialog";
import { trpc } from "#frontend/lib/trpc";
import { Button } from "#frontend/components/ui/button/button";
import { Dialog } from "#frontend/components/ui/dialog/dialog";
import { FormError } from "#frontend/components/ui/form/error/error";
import { Input } from "#frontend/components/ui/form/input/input";
import { capitalizeFirstLetter } from "#frontend/utils/primitives/string";
import { formatNumber } from "#frontend/utils/internationalization/intl";
import { budgetFormSchema, BudgetFormSchemaError } from "#frontend/types/zod";

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
  const createBudget = trpc.budget.createBudget.useMutation();

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
      userId,
      ...formData,
    };
    const parsedData = budgetFormSchema.safeParse(payload);

    if (!parsedData.success) {
      setFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    createBudget.mutate(parsedData.data, {
      onSuccess: (data) => {
        console.log("new budget created:", data);
        utils.budget.invalidate();
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
    <div>
      <Dialog ref={dialogRef} className="budget">
        <form method="post" onSubmit={handleSubmit}>
          <h2>Add New Budget</h2>
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
          <FormError message={fieldErrors?.category} />
          <Input
            label="Maximum Spend"
            placeholder="e.g. 2000"
            type="number"
            name="amount"
            error={fieldErrors?.amount}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Dialog>
      <div>
        <h1>Budgets</h1>
        <Button type="button" onClick={openDialog}>
          + Add New Budget
        </Button>
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
      {budgets?.map((budget) => (
        <div>
          <h2>{capitalizeFirstLetter(budget.category)}</h2>
          <p>
            Maximum of $
            {formatNumber(Number(budget.maxAmount), {
              opts: {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            })}
          </p>
          <div>
            <div></div>
          </div>
          <div>
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
                ,
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
          <div>
            <div>
              <h3>Latest Spending</h3>
              <Link to="../transactions">See All</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
