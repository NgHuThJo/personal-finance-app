import { http, HttpResponse } from "msw";

export const accountHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/account.getBalance`, () => {
    const mockResponse = {
      result: {
        data: {
          income: "10.00",
          expense: "7.00",
        },
        error: null,
      },
    };

    return HttpResponse.json(mockResponse);
  }),
];
