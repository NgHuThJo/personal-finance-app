import { Logger } from "#frontend/shared/app/logging";
import { createRefreshToken } from "#frontend/shared/client";
import type { ClientOptions } from "#frontend/shared/client";
import { createClient, createConfig } from "#frontend/shared/client/client";
import { accessTokenStore } from "#frontend/shared/store/access-token";
import { createInFlight } from "#frontend/shared/utils/concurrency/single-flight";

// Keep copies of the incoming request bodies to retry later
// Potential to break if assumption that Request is always the same in the entire request-response lifecycle becomes false
const requestBodyDictionary = new Map<Request, Request>();
// Create new instance because deep cloning does not work with functions as properties
export const clientWithAuth = createClient(
  createConfig<ClientOptions>({
    baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
  }),
);

const refreshAccessToken = async () => {
  try {
    const result = await createRefreshToken({ credentials: "include" });
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
  request.headers.set("Authorization", `Bearer ${accessToken}`);
}

clientWithAuth.interceptors.request.use(async (request) => {
  const accessToken = accessTokenStore.getState().accessToken;
  requestBodyDictionary.set(request, request.clone());

  if (accessToken) {
    withBearerToken(request, accessToken);
  }

  return request;
});

clientWithAuth.interceptors.response.use(async (response, request, options) => {
  if (response.status < 400) {
    return response;
  }

  if (response.status === 401) {
    const accessToken = await inFlightRequestNewAccessTokenFn();

    if (!accessToken) {
      throw new Error("Refresh request failed to produce access token");
    }

    const retryRequest = requestBodyDictionary.get(request);

    if (!retryRequest) {
      throw Error(
        `Old and new request in ${withBearerToken.name} do not match`,
      );
    }

    withBearerToken(retryRequest, accessToken);
    const retryResponse = await fetch(retryRequest);

    if (retryResponse.status >= 400) {
      const retryError = await retryResponse.json();

      throw retryError;
    }

    return retryResponse;
  }

  const error = await response.json();
  throw error;
});
