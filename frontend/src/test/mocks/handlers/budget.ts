import { http, HttpResponse } from "msw";
import { createBudgetMock } from "#frontend/test/mocks/factories/budget";
import {
  getScenario,
  resolveScenario,
} from "#frontend/test/mocks/utils/scenario";

const apiUrl = import.meta.env.VITE_API_URL;

export const budgetHandlers = [
  http.get(`${apiUrl}/budget.getAllBudgets`, () => {
    const scenario = getScenario();

    if (scenario) {
      return resolveScenario(scenario);
    }

    console.log("inside budget.getAllBudgets handler");

    return HttpResponse.json(createBudgetMock());
  }),
];
