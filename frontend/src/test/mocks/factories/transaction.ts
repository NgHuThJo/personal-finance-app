import { createTRPCShape } from "#frontend/test/mocks/node";

type Transaction = Partial<{
  id: number;
  senderId: number;
  recipientId: number;
  transactionAmount: string;
  createdAt: string;
  category: string;
  sender: Username;
  recipient: Username;
}>[];

type Username = {
  firstName: string;
  lastName: string;
};

export const createTransactionMock = (extraData: Transaction = []) => {
  const data = [
    {
      id: 1,
      senderId: 1,
      recipientId: 2,
      transactionAmount: "1000.00",
      createdAt: "1/1/2024",
      category: "ENTERTAINMENT",
      sender: {
        firstName: "John",
        lastName: "Doe",
      },
      recipient: {
        firstName: "Jane",
        lastName: "Foe",
      },
    },
    {
      id: 2,
      senderId: 2,
      recipientId: 1,
      transactionAmount: "500.00",
      createdAt: "2/1/2024",
      category: "BILLS",
      sender: {
        firstName: "Jane",
        lastName: "Foe",
      },
      recipient: {
        firstName: "John",
        lastName: "Doe",
      },
    },
    ...extraData,
  ];

  return createTRPCShape(data);
};
