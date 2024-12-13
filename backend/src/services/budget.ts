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
      },
    });

    return budgets;
  }
}

export const budgetService = new BudgetService();
