import { Logger } from "#frontend/shared/app/logging";
import { getApiAuthRefresh } from "#frontend/shared/client";
import { client } from "#frontend/shared/client/client.gen";
import { accessTokenStore } from "#frontend/shared/store/access-token";

function withBearerToken(request: Request, accessToken: string) {
  request.headers.set("Authorization", `Bearer ${accessToken}`);
}

function formatErrorMessage(...errors: unknown[]) {
  return errors.join(", ");
}

export const clientWithAuth = client;

clientWithAuth.interceptors.request.use(async (request) => {
  const accessToken = accessTokenStore.getState().accessToken;

  if (accessToken) {
    withBearerToken(request, accessToken);
  }

  return request;
});

clientWithAuth.interceptors.response.use(async (response, request, options) => {
  let refreshResponse;
  let retryResponse;
  const setAccessToken = accessTokenStore.getState().setAccessToken;

  if (response.status < 400) {
    return response;
  }

  if (response.status === 401) {
    try {
      refreshResponse = await getApiAuthRefresh({
        credentials: "include",
      });

      const accessToken = refreshResponse.data?.accessToken;

      if (accessToken) {
        const newRequest = new Request(request);
        withBearerToken(newRequest, accessToken);

        retryResponse = await fetch(newRequest);

        if (retryResponse.status < 400) {
          throw new Error(
            "Retry request after getting new access token failed",
            {
              cause: formatErrorMessage(
                retryResponse.status,
                retryResponse.statusText,
                retryResponse.url,
              ),
            },
          );
        }

        return retryResponse;
      }
    } catch (error) {
      Logger.error("Refresh token either expired or revoked", error);
      setAccessToken(null);
    }
  }

  throw new Error("Some fetch error occurred", {
    cause: formatErrorMessage(
      response.status,
      response.statusText,
      response.url,
    ),
  });
});
