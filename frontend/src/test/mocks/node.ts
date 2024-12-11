import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

export const mockPostHttpError = (endpoint: string) => {
  server.use(
    http.post(endpoint, () => {
      return HttpResponse.error();
    }),
  );
};

export const mockGetHttpError = (endpoint: string) => {
  server.use(
    http.get(endpoint, () => {
      return HttpResponse.error();
    }),
  );
};
