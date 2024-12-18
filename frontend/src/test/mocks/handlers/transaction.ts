import { http, HttpResponse } from "msw";
import { createTransactionMock } from "#frontend/test/mocks/factories/transaction";
import {
  getScenario,
  resolveScenario,
} from "#frontend/test/mocks/utils/scenario";

const apiUrl = import.meta.env.VITE_API_URL;

export const transactionHandlers = [
  http.get(`${apiUrl}/transaction.getAllTransactions`, () => {
    const scenario = getScenario();

    if (scenario) {
      return resolveScenario(scenario);
    }

    return HttpResponse.json(createTransactionMock());
  }),
];
