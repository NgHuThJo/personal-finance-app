/* export async function fetchData(
  url: string | Request | URL,
  options?: RequestInit,
) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
} */

import { client } from "#frontend/shared/client/client.gen";
import { useAccessToken } from "#frontend/shared/store/access-token";

export const clientWithAuth = client;

clientWithAuth.interceptors.request.use(async (request) => {
  const accessToken = useAccessToken();

  if (accessToken) {
    request.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return request;
});

client.interceptors.response.use(async (response, options) => {
  let refreshResponse;
  let retryResponse;

  if (response.status === 401) {
    refreshResponse = await client.post({
      url: `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/refresh`,
      credentials: "include",
    });
  }

  // if (refreshResponse?.response.status !== 401) {
  //   retryResponse = await client.
  // }

  return response;
});
