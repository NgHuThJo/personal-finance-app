import { http, HttpResponse } from "msw";

const mockResponse = {
  result: {
    data: {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "JohnDoe@gmail.com",
      password: "password",
    },
    error: null,
  },
};

export const handlers = [
  http.post(`${import.meta.env.VITE_API_URL}/user.registerUser`, async () => {
    return HttpResponse.json(mockResponse);
  }),
];
