import "@testing-library/jest-dom/vitest";
import { afterAll, beforeAll, afterEach } from "vitest";
import { server } from "./mocks/node";

beforeAll(() => {
  server.listen();
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});
