import { http, HttpResponse } from "msw";

export const budgetHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/budget.getAllBudgets`, () => {
    const mockResponse = {
      result: {
        data: [
          {
            maxAmount: "100.00",
            spentAmount: "70.00",
          },
          {
            maxAmount: "20.00",
            spentAmount: "10.00",
          },
        ],
        error: null,
      },
    };

    return HttpResponse.json(mockResponse);
  }),
];
