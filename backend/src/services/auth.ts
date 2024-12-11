import { prisma } from "#backend/models/index.js";
import { AppError } from "#backend/utils/app-error.js";

class AuthService {
  async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      omit: {
        password: false,
      },
    });

    if (!user) {
      throw new AppError(
        "NOT_FOUND",
        `No user with email address ${email} found`,
      );
    }

    if (user.password !== password) {
      throw new AppError("UNAUTHORIZED", "Passwords do not match");
    }

    return { id: user.id };
  }
}

export const authService = new AuthService();
