import { accountHandlers } from "#frontend/test/mocks/handlers/account";
import { authHandlers } from "#frontend/test/mocks/handlers/auth";
import { budgetHandlers } from "#frontend/test/mocks/handlers/budget";
import { potHandlers } from "#frontend/test/mocks/handlers/pot";
import { userHandlers } from "#frontend/test/mocks/handlers/user";
import { transactionHandlers } from "#frontend/test/mocks/handlers/transaction";

export const handlers = [
  ...accountHandlers,
  ...authHandlers,
  ...budgetHandlers,
  ...potHandlers,
  ...userHandlers,
  ...transactionHandlers,
];
