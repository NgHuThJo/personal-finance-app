import { ChangeEvent, FormEvent, useState } from "react";
import { useUserId } from "#frontend/providers/auth-context";
import { useDialog } from "#frontend/hooks/use-dialog";
import { trpc } from "#frontend/lib/trpc";
import { Button } from "#frontend/components/ui/button/button";
import { Dialog } from "#frontend/components/ui/dialog/dialog";
import { FormError } from "#frontend/components/ui/form/error/error";
import { Input } from "#frontend/components/ui/form/input/input";
import { SearchBar } from "#frontend/components/ui/form/search/search";
import {
  formatDate,
  formatNumber,
} from "#frontend/utils/internationalization/intl";
import { capitalizeFirstLetter } from "#frontend/utils/primitives/string";
import {
  filterTransactions,
  TransactionFilter,
} from "#frontend/utils/sort/filter";
import {
  Action,
  isSender,
  sortTransactions,
} from "#frontend/domain/transaction";
import { getFullName } from "#frontend/domain/user";
import {
  transactionFormSchema,
  TransactionFormSchemaError,
} from "#frontend/types/zod";
import { Close } from "#frontend/components/ui/icon/icon";
import styles from "./transaction.module.css";

export function Transaction() {
  const utils = trpc.useUtils();
  const [fieldErrors, setFieldErrors] = useState<TransactionFormSchemaError>(
    {},
  );
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<Action>("Newest");
  const [filter, setFilter] = useState<TransactionFilter>("ALL");
  const { dialogRef, openDialog, closeDialog } = useDialog();
  const userId = useUserId();
  const createTransaction = trpc.transaction.createTransaction.useMutation();
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

  const handleFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    const category = event.currentTarget.value as TransactionFilter;

    setFilter(category);
  };

  const handleSort = (event: ChangeEvent<HTMLSelectElement>) => {
    const order = event.currentTarget.value as Action;

    setOrder(order);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const search = event.currentTarget.value;

    setSearch(search);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      userId,
      ...formData,
    };
    const parsedData = transactionFormSchema.safeParse(payload);

    if (!parsedData.success) {
      setFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    createTransaction.mutate(parsedData.data, {
      onSuccess: () => {
        utils.transaction.getAllTransactions.invalidate();
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

  const filteredTransactions = sortTransactions(
    filterTransactions(transactions, filter),
    order,
  );
  const searchResults =
    filteredTransactions?.filter((transaction) =>
      getFullName(transaction.sender)
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
    ) ?? filteredTransactions;

  return (
    <div className={styles.container}>
      <Dialog ref={dialogRef} className="add-dialog">
        <form method="post" onSubmit={handleSubmit}>
          <div>
            <h2>Add New Transaction</h2>
            <Button type="button" onClick={closeDialog}>
              <Close />
            </Button>
          </div>
          <Input
            label="Transaction Name"
            name="email"
            type="text"
            placeholder="e.g. email@email.com"
            error={fieldErrors?.email}
          />
          <label htmlFor="category">
            Category
            <select defaultValue={""} name="category" id="category">
              <option value="" disabled>
                Select a category
              </option>
              <option value="ENTERTAINMENT">Entertainment</option>
              <option value="BILLS">Bills</option>
              <option value="GROCERIES">Groceries</option>
              <option value="TRANSPORTATION">Transportation</option>
            </select>
            {fieldErrors?.category?.map((error) => (
              <FormError message={error} />
            ))}
          </label>
          <Input
            label="Amount"
            name="amount"
            type="number"
            placeholder="e.g. $1000"
            error={fieldErrors?.amount}
          />
          <Button type="submit" className="add">
            Submit
          </Button>
          {createTransaction.isError && (
            <p>{createTransaction.error.message}</p>
          )}
          {createTransaction.isSuccess && (
            <p>Transaction successfully created</p>
          )}
        </form>
      </Dialog>
      <div className={styles.header}>
        <h1>Transactions</h1>
        <Button onClick={openDialog} className="add">
          + Add New Transaction
        </Button>
      </div>
      <div className={styles["transaction-list"]}>
        <div className={styles.filters}>
          <SearchBar filterFn={handleSearch} placeholder={"Search..."} />
          <div>
            <select data-testid="sort-select" onChange={handleSort}>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="AtoZ">A to Z</option>
              <option value="ZtoA">Z to A</option>
              <option value="Highest">Highest</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>
          <div>
            <select
              defaultValue={filter}
              data-testid="filter-select"
              onChange={handleFilter}
            >
              <option value="ALL">All Transactions</option>
              <option value="ENTERTAINMENT">Entertainment</option>
              <option value="BILLS">Bills</option>
              <option value="GROCERIES">Groceries</option>
              <option value="TRANSPORTATION">Transportation</option>
            </select>
          </div>
        </div>
        {searchResults?.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Recipient/Sender</th>
                <th>Category</th>
                <th>Transaction Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {searchResults?.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    {isSender(transaction, userId)
                      ? getFullName(transaction.recipient)
                      : getFullName(transaction.sender)}
                  </td>
                  <td>
                    {capitalizeFirstLetter(transaction.category.toLowerCase())}
                  </td>
                  <td>{formatDate(new Date(transaction.createdAt))}</td>
                  <td
                    className={
                      transaction.senderId === userId
                        ? styles.minus
                        : styles.plus
                    }
                  >
                    {transaction.senderId === userId ? "-" : "+"}$
                    {formatNumber(Number(transaction.transactionAmount), {
                      opts: {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    })}
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
