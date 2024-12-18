import { http, HttpResponse } from "msw";
import { createAccountMock } from "#frontend/test/mocks/factories/account";
import {
  getScenario,
  resolveScenario,
} from "#frontend/test/mocks/utils/scenario";

const apiUrl = import.meta.env.VITE_API_URL;

export const accountHandlers = [
  http.get(`${apiUrl}/account.getBalance`, () => {
    const scenario = getScenario();

    if (scenario) {
      return resolveScenario(scenario);
    }

    return HttpResponse.json(createAccountMock());
  }),
];
