import "@testing-library/jest-dom/vitest";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { server } from "./mocks/node";

beforeAll(() => {
  server.listen();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  server.resetHandlers();
});
