import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

type HttpMethod = "get" | "post";

const httpMethodMap: Record<HttpMethod, any> = {
  get: http.get,
  post: http.post,
};

export const server = setupServer(...handlers);

export const mockHttpError = (endpoint: string, method: HttpMethod) => {
  server.use(
    httpMethodMap[method](endpoint, () => {
      return HttpResponse.error();
    }),
  );
};

export const createTRPCShape = (data: object | any[], error?: any) => ({
  result: {
    data,
    error,
  },
});
