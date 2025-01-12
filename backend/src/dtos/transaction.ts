import { Prisma } from "@prisma/client";
import {
  convertToString,
  convertDateToISOString,
} from "#backend/utils/transformers.js";

export function mapToTransactionDTO(
  transactions: Prisma.TransactionGetPayload<{
    include: {
      sender: true;
      recipient: true;
    };
  }>[],
) {
  return transactions.map((transaction) => ({
    id: transaction.id,
    senderId: transaction.senderId,
    recipientId: transaction.recipientId,
    transactionAmount: convertToString(transaction.transactionAmount),
    category: transaction.category,
    createdAt: convertDateToISOString(transaction.createdAt),
    updatedAt: convertDateToISOString(transaction.updatedAt),
    sender: {
      firstName: transaction.sender.firstName,
      lastName: transaction.sender.lastName,
    },
    recipient: {
      firstName: transaction.recipient.firstName,
      lastName: transaction.recipient.lastName,
    },
  }));
}
