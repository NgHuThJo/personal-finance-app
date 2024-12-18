import { HttpResponse } from "msw";
import { createTRPCShape } from "#frontend/test/mocks/node";

type Scenario = "noObjectData" | "noArrayData" | "error" | null;

let globalScenario: Scenario = null;

export const resolveScenario = (scenario: Scenario) => {
  switch (scenario) {
    case "noObjectData":
      return HttpResponse.json(createTRPCShape({}));
    case "noArrayData":
      return HttpResponse.json(createTRPCShape([]));
    case "error":
      return HttpResponse.error();
  }
};

export const getScenario = () => globalScenario;

export const setScenario = (scenario: Scenario) => {
  globalScenario = scenario;
};
