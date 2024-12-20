import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

export const createTRPCShape = (data: object | any[], error?: any) => ({
  result: {
    data,
    error,
  },
});
