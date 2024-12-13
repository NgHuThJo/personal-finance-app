import { prisma } from "#backend/models/index.js";

class TransactionService {
  async getAllTransactions(data: { userId: number }) {
    const transactions = prisma.transaction.findMany({
      where: {
        OR: [
          {
            senderId: data.userId,
          },
          {
            recipientId: data.userId,
          },
        ],
      },
    });

    return transactions;
  }
}

export const transactionService = new TransactionService();
