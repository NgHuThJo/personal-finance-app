import { http, HttpResponse } from "msw";

export const authHandlers = [
  http.post(`${import.meta.env.VITE_API_URL}/auth.loginUser`, () => {
    const mockResponse = {
      result: {
        data: {
          id: 1,
        },
        error: null,
      },
    };
    return HttpResponse.json(mockResponse);
  }),
];
