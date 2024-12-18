import { http, HttpResponse } from "msw";
import { createPotMock } from "#frontend/test/mocks/factories/pot";
import {
  getScenario,
  resolveScenario,
} from "#frontend/test/mocks/utils/scenario";

const apiUrl = import.meta.env.VITE_API_URL;

export const potHandlers = [
  http.get(`${apiUrl}/pot.getAllPots`, () => {
    const scenario = getScenario();

    if (scenario) {
      return resolveScenario(scenario);
    }

    return HttpResponse.json(createPotMock());
  }),
];
