import { http, HttpResponse } from "msw";
import { createUserMock } from "#frontend/test/mocks/factories/user";
import {
  getScenario,
  resolveScenario,
} from "#frontend/test/mocks/utils/scenario";

const apiUrl = import.meta.env.VITE_API_URL;

export const userHandlers = [
  http.post(`${apiUrl}/user.registerUser`, () => {
    const scenario = getScenario();

    if (scenario) {
      return resolveScenario(scenario);
    }

    return HttpResponse.json(createUserMock());
  }),
];
