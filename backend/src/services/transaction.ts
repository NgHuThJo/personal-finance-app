import { prisma } from "#backend/models/index.js";

class TransactionService {
  async getAllTransactions(data: { userId: number }) {
    const transactions = await prisma.transaction.findMany({
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
      omit: {
        updatedAt: true,
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        recipient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return transactions;
  }
}

export const transactionService = new TransactionService();
