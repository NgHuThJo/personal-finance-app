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
  http.post(`${apiUrl}/transaction.createTransaction`, () => {
    const scenario = getScenario();

    if (scenario) {
      return resolveScenario(scenario);
    }

    console.log("in createTransaction");

    return HttpResponse.json(
      createTransactionMock([
        {
          id: 3,
          senderId: 1,
          recipientId: 2,
          transactionAmount: "1000.00",
          createdAt: "1/1/2024",
          category: "ENTERTAINMENT",
          sender: {
            firstName: "John",
            lastName: "Doe",
          },
          recipient: {
            firstName: "test",
            lastName: "Foe",
          },
        },
      ]),
    );
  }),
];
