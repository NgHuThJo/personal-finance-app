import { http, HttpResponse } from "msw";

export const handlers = [
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
  http.get(`${import.meta.env.VITE_API_URL}/account.getBalance`, () => {
    const mockResponse = {
      result: {
        data: {
          income: 10,
          expense: 7,
        },
        error: null,
      },
    };

    console.log(mockResponse);
    return HttpResponse.json(mockResponse);
  }),
];
