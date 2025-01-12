import { Category } from ".prisma/client";
import { prisma } from "#backend/models/index.js";
import { AppError } from "#backend/utils/app-error.js";

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
      include: {
        sender: true,
        recipient: true,
      },
    });

    return transactions;
  }

  async createTransaction(data: {
    amount: number;
    category: string;
    email: string;
    userId: number;
  }) {
    const { amount, category, email, userId } = data;

    const emailId = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (!emailId) {
      throw new AppError("NOT_FOUND", `No user with email ${email} found`);
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        transactionAmount: amount,
        category: category.toUpperCase() as Category,
        sender: {
          connect: {
            id: userId,
          },
        },
        recipient: {
          connect: {
            id: emailId.id,
          },
        },
      },
    });

    return newTransaction;
  }
}

export const transactionService = new TransactionService();
