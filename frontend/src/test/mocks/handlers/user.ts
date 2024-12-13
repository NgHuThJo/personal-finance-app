import { http, HttpResponse } from "msw";

export const userHandlers = [
  http.post(`${import.meta.env.VITE_API_URL}/user.registerUser`, () => {
    const mockResponse = {
      result: {
        data: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "JohnDoe@gmail.com",
        },
        error: null,
      },
    };
    return HttpResponse.json(mockResponse);
  }),
];
