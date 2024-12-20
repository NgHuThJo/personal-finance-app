import { createTRPCShape } from "#frontend/test/mocks/node";

type Pot = Partial<{
  maxAmount: string;
  spentAmount: string;
}>[];

export const createPotMock = (extraData: Pot = []) => {
  const data = [
    {
      name: "Bills",
      totalAmount: "1000.00",
      savedAmount: "300.00",
    },
    ...extraData,
  ];
  return createTRPCShape(data);
};
