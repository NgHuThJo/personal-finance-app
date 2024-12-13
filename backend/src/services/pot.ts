import { prisma } from "#backend/models/index.js";
import { AppError } from "#backend/utils/app-error.js";

class PotService {
  async getAllPots(data: { userId: number }) {
    const pots = await prisma.pot.findMany({
      where: {
        userId: data.userId,
      },
      select: {
        totalAmount: true,
        savedAmount: true,
      },
    });

    return pots;
  }
}

export const potService = new PotService();
