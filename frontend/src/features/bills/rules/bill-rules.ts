import type { GetAllRecurringBillsTransactionDto } from "#frontend/shared/client";

class BillRules {
  calculatePaidBillsTotalSum(
    transactionAmounts: GetAllRecurringBillsTransactionDto[],
  ) {
    return transactionAmounts.reduce((acc, curr) => {
      return acc + curr.amount;
    }, 0);
  }

  isBillPaid(transactionDate: string) {
    return new Date(transactionDate).getTime() < Date.now();
  }
}

export const billRules = new BillRules();
