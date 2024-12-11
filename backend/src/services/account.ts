import { prisma } from "#backend/models/index.js";
import { AppError } from "#backend/utils/app-error.js";

class AccountService {
  async getBalance(data: { userId: number }) {
    const balance = await prisma.account.findFirst({
      where: {
        userId: data.userId,
      },
      select: {
        income: true,
        expense: true,
      },
    });

    return balance;
  }
}

export const accountService = new AccountService();
