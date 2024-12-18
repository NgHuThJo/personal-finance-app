import { createTRPCShape } from "#frontend/test/mocks/node";

type User = Partial<{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}>;

export const createUserMock = (overrides: User = {}) => {
  const data = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@email.com",
    ...overrides,
  };
  return createTRPCShape(data);
};
