import { http, HttpResponse } from "msw";

export const potHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/pot.getAllPots`, () => {
    const mockResponse = {
      result: {
        data: [
          {
            totalAmount: "200.00",
            savedAmount: "70.00",
          },
        ],
        error: null,
      },
    };

    console.log("get pots", mockResponse);
    return HttpResponse.json(mockResponse);
  }),
];
