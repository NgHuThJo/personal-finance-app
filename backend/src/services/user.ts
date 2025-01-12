import { prisma } from "#backend/models/index.js";
import { AppError } from "#backend/utils/app-error.js";

class UserService {
  async registerUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    const isEmailAvailable = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (isEmailAvailable) {
      throw new AppError(
        "CONFLICT",
        `Email address ${data.email} is not available`,
      );
    }

    const normalizdData = {
      ...data,
      email: data.email.toLowerCase(),
    };

    const newUser = await prisma.user.create({
      data: normalizdData,
    });

    return newUser;
  }
}

export const userService = new UserService();
