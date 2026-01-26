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

import { getApiAuthRefresh } from "#frontend/shared/client";
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

clientWithAuth.interceptors.response.use(async (response, request, options) => {
  let refreshResponse;
  let retryResponse;

  if (response.status < 400) {
    return response;
  }

  if (response.status === 401) {
    refreshResponse = await getApiAuthRefresh({
      credentials: "include",
    });

    const accessToken = refreshResponse.data?.accessToken;

    if (accessToken) {
      const newRequest = new Request({
        ...request,
      });
      newRequest.headers.set("Authorization", `Beaer ${accessToken}`);

      retryResponse = await fetch(newRequest);

      return retryResponse;
    }
  }

  throw new Error("Some error happened", {
    cause: response.statusText,
  });
});
