import { createTRPCShape } from "#frontend/test/mocks/node";

type Budget = Partial<{
  maxAmount: string;
  spentAmount: string;
}>[];

export const createBudgetMock = (extraData: Budget = []) => {
  const data = [
    {
      maxAmount: "100.00",
      spentAmount: "70.00",
      category: "Bills",
    },
    {
      maxAmount: "20.00",
      spentAmount: "10.00",
      category: "Groceries",
    },
    ...extraData,
  ];
  return createTRPCShape(data);
};
