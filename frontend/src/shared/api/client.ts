import { Logger } from "#frontend/shared/app/logging";
import { getApiAuthRefresh } from "#frontend/shared/client";
import { client } from "#frontend/shared/client/client.gen";
import { accessTokenStore } from "#frontend/shared/store/access-token";
import { createInFlight } from "#frontend/shared/utils/concurrency/single-flight";

export const clientWithAuth = client;

const refreshAccessToken = async () => {
  try {
    const result = await getApiAuthRefresh({ credentials: "include" });
    const accessToken = result.data?.accessToken ?? null;
    accessTokenStore.getState().setAccessToken(accessToken);
    return accessToken;
  } catch (error) {
    Logger.error("Refresh token expired or revoked", error);
    accessTokenStore.getState().setAccessToken(null);
    return null;
  }
};

const inFlightRequestNewAccessTokenFn = createInFlight(refreshAccessToken);

function withBearerToken(request: Request, accessToken: string) {
  const next = new Request(request);
  next.headers.set("Authorization", `Bearer ${accessToken}`);
  return next;
}

function formatErrorMessage(...errors: unknown[]) {
  return errors.join(", ");
}

clientWithAuth.interceptors.request.use(async (request) => {
  const accessToken = accessTokenStore.getState().accessToken;

  return accessToken ? withBearerToken(request, accessToken) : request;
});

clientWithAuth.interceptors.response.use(async (response, request, options) => {
  if (response.status < 400) {
    return response;
  }

  if (response.status === 401) {
    const accessToken = await inFlightRequestNewAccessTokenFn();

    if (!accessToken) {
      throw new Error("Refresh request failed to produce access token", {
        cause: formatErrorMessage(
          response.status,
          response.statusText,
          response.url,
        ),
      });
    }

    const retryRequest = withBearerToken(request, accessToken);
    const retryResponse = await fetch(retryRequest);

    if (retryResponse.status >= 400) {
      throw new Error("Retry request after refresh of access token failed", {
        cause: formatErrorMessage(
          retryResponse.status,
          retryResponse.statusText,
          retryResponse.url,
        ),
      });
    }

    return retryResponse;
  }

  throw new Error("An unknown fetch error occurred", {
    cause: formatErrorMessage(
      response.status,
      response.statusText,
      response.url,
    ),
  });
});
