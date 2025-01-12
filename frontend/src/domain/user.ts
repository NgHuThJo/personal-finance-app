import { User } from "@prisma/client";

export function getFullName(user: Pick<User, "firstName" | "lastName">) {
  const { firstName, lastName } = user;

  return `${firstName} ${lastName}`;
}
