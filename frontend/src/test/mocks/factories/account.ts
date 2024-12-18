import { createTRPCShape } from "#frontend/test/mocks/node";

type Account = Partial<{
  income: string;
  expense: string;
}>;

export const createAccountMock = (overrides: Account = {}) => {
  const data = { income: "1000.00", expense: "300.00", ...overrides };
  return createTRPCShape(data);
};
