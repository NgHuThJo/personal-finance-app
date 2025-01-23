import { TransactionQueryOutput } from "#frontend/types/trpc";

export type Action =
  | "Newest"
  | "Oldest"
  | "AtoZ"
  | "ZtoA"
  | "Highest"
  | "Lowest";

export function isSender(
  transaction: Pick<TransactionQueryOutput, "senderId">,
  userId: number,
) {
  const { senderId } = transaction;

  return senderId === userId;
}

export function sortTransactions<T extends TransactionQueryOutput>(
  data: T[] | undefined,
  action: Action,
) {
  if (!data) {
    return data;
  }

  switch (action) {
    case "Newest":
      return data.sort(
        (a, b) =>
          new Date(b.createdAt).getMilliseconds() -
          new Date(a.createdAt).getMilliseconds(),
      );
    case "Oldest":
      return data.sort(
        (a, b) =>
          new Date(a.createdAt).getMilliseconds() -
          new Date(b.createdAt).getMilliseconds(),
      );
    case "AtoZ":
      return data.sort((a, b) => {
        const stringA = a.category.toUpperCase();
        const stringB = b.category.toUpperCase();

        if (stringA < stringB) {
          return -1;
        }

        if (stringA > stringB) {
          return 1;
        }

        return 0;
      });
    case "ZtoA":
      return data.sort((a, b) => {
        const stringA = a.category.toUpperCase();
        const stringB = b.category.toUpperCase();

        if (stringA > stringB) {
          return -1;
        }

        if (stringA < stringB) {
          return 1;
        }

        return 0;
      });
    case "Highest":
      return data.sort((a, b) => {
        const numberA = Number(a.transactionAmount);
        const numberB = Number(b.transactionAmount);

        return numberB - numberA;
      });
    case "Lowest":
      return data.sort((a, b) => {
        const numberA = Number(a.transactionAmount);
        const numberB = Number(b.transactionAmount);

        return numberA - numberB;
      });
    default:
      console.log("Invalid action in sortTransactions");
      return data;
  }
}
