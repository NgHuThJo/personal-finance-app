import { Category } from "@prisma/client";
import { prisma } from "#backend/models/index.js";

class BudgetService {
  async getAllBudgets(data: { userId: number }) {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: data.userId,
      },
      select: {
        spentAmount: true,
        maxAmount: true,
        category: true,
      },
    });

    return budgets;
  }

  async createBudget(data: {
    userId: number;
    category: string;
    amount: number;
  }) {
    const budget = await prisma.budget.upsert({
      where: {
        userId: data.userId,
        category: data.category as Category,
      },
      update: {
        maxAmount: data.amount,
      },
      create: {
        category: data.category as Category,
        maxAmount: data.amount,
        user: {
          connect: {
            id: data.userId,
          },
        },
      },
    });

    return budget;
  }

  async deleteBudget(data: { userId: number; category: string }) {}
}

export const budgetService = new BudgetService();
