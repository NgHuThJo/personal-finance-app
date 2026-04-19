import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./budget-card.module.css";
import { CaretRight } from "#frontend/assets/icons/icons";
import { BudgetCardPopover } from "#frontend/features/budget/components/budget-popover";
import { BudgetProgressBar } from "#frontend/features/budget/components/budget-progressbar";
import { DeleteBudgetDialog } from "#frontend/features/budget/components/delete-budget-dialog";
import { EditBudgetDialog } from "#frontend/features/budget/components/edit-budget-dialog";
import { clientWithAuth } from "#frontend/shared/api/client";
import type { GetAllBudgetsResponse } from "#frontend/shared/client";
import {
  createRefreshTokenOptions,
  getAllTransactionsOptions,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#frontend/shared/primitives/card";
import { appLinkOptions } from "#frontend/shared/router/options/linkOptions";
import { getColorHexCode } from "#frontend/shared/utils/color";
import { dateTimeFormatter } from "#frontend/shared/utils/intl/datetime-format";
import { numberFormatter } from "#frontend/shared/utils/intl/number-format";
import { decodeJwt } from "#frontend/shared/utils/object";

type BudgetCardProps = {
  budgetData: GetAllBudgetsResponse;
};

export function BudgetCard({ budgetData }: BudgetCardProps) {
  const {
    data: { data: transactionData },
  } = useSuspenseQuery({
    ...getAllTransactionsOptions({
      client: clientWithAuth,
    }),
  });
  const { data: accessToken } = useQuery({
    ...createRefreshTokenOptions(),
    enabled: false,
  });
  const [isEditDialogOpen, setEditDialog] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialog] = useState(false);

  const { category, maximum, themeColor } = budgetData;

  const filteredTransactions = transactionData.filter(
    (t) => t.category === budgetData.category,
  );

  const transactionAmount = filteredTransactions.reduce(
    (prev, curr) => prev + curr.amount,
    0,
  );

  const openEditDialogInPopup = () => {
    setEditDialog(true);
  };
  const openDeleteDialogInPopup = () => {
    setDeleteDialog(true);
  };
  const toggleEditDialog = (shouldOpen: boolean) => {
    setEditDialog(shouldOpen);
  };
  const toggleDeleteDialog = (shouldOpen: boolean) => {
    setDeleteDialog(shouldOpen);
  };

  const userId = Number(decodeJwt(accessToken?.accessToken as string).sub);
  const colorHexCode = getColorHexCode(themeColor);

  return (
    <Card data-testid="budget-card">
      <CardHeader>
        <CardTitle>
          <div className={styles["theme-heading"]}>
            <span
              className={styles["theme-icon"]}
              style={{
                "--color-theme-icon": `${colorHexCode}`,
              }}
            ></span>
            <span>{category}</span>
          </div>
        </CardTitle>{" "}
        <BudgetCardPopover
          dialogHandlers={{
            openEditDialog: openEditDialogInPopup,
            openDeleteDialog: openDeleteDialogInPopup,
          }}
        />
      </CardHeader>
      <CardContent>
        <BudgetProgressBar
          maximum={maximum}
          spent={transactionAmount}
          themeColor={themeColor}
        />
      </CardContent>
      <CardFooter>
        <div className={styles["footer-background"]}>
          <div className={styles["footer-header"]}>
            <h2 className={styles["footer-heading"]}>Latest Spending</h2>
            <Link
              {...appLinkOptions.getTransactionLinkOptions()}
              to="/transactions"
              className={styles["link"]}
            >
              See All
              <CaretRight />
            </Link>
          </div>
          {filteredTransactions.length === 0 ? (
            <p className={styles["footer-text"]}>
              You haven't made any spendings yet.
            </p>
          ) : (
            <ul className={styles["transaction-list"]}>
              {filteredTransactions.map(
                ({
                  otherUser: { name },
                  amount,
                  transactionDate,
                  senderId,
                }) => (
                  <li className={styles["transaction"]}>
                    <span className={styles["transaction-name"]}>{name}</span>
                    <div className={styles["transaction-summary"]}>
                      <span
                        className={`
                          ${styles["transaction-amount"]}
                        ${
                          styles[
                            senderId === userId ? "amount-minus" : "amount-plus"
                          ]
                        }`}
                      >
                        {senderId == userId ? "-" : "+"}
                        {numberFormatter.formatNumber({
                          number: amount,
                          options: numberFormatter.getDollarOptions(),
                        })}
                      </span>
                      <span className={styles["transaction-date"]}>
                        {dateTimeFormatter.formatDate({
                          date: new Date(transactionDate),
                        })}
                      </span>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </CardFooter>
      {isEditDialogOpen && (
        <EditBudgetDialog
          budgetData={budgetData}
          isEditDialogOpen={isEditDialogOpen}
          toggleEditDialog={toggleEditDialog}
        />
      )}
      {isDeleteDialogOpen && (
        <DeleteBudgetDialog
          budgetData={budgetData}
          isDeleteDialogOpen={isDeleteDialogOpen}
          toggleDeleteDialog={toggleDeleteDialog}
        />
      )}
    </Card>
  );
}
