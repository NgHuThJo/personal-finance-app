import { prisma } from "#backend/models/index.js";
import { AppError } from "#backend/utils/app-error.js";

class PotService {
  async getAllPots(data: { userId: number }) {
    const pots = await prisma.pot.findMany({
      where: {
        userId: data.userId,
      },
      select: {
        id: true,
        name: true,
        totalAmount: true,
        savedAmount: true,
      },
    });

    return pots;
  }

  async deletePot(data: { id: number }) {
    const deletedPot = await prisma.pot.deleteMany({
      where: {
        id: data.id,
      },
    });

    return deletedPot;
  }

  async createPot(data: { userId: number; name: string; totalAmount: number }) {
    const newPot = await prisma.pot.create({
      data: {
        userId: data.userId,
        name: data.name,
        totalAmount: data.totalAmount,
      },
    });

    return newPot;
  }
}

export const potService = new PotService();
