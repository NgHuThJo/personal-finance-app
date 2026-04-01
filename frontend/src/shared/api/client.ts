import { QueryCache, QueryClient } from "@tanstack/react-query";
import { Logger } from "#frontend/shared/app/logging";
import {
  createRefreshToken,
  type CreateRefreshTokenResponse,
  type ClientOptions,
} from "#frontend/shared/client";

import { createRefreshTokenQueryKey } from "#frontend/shared/client/@tanstack/react-query.gen";
import { createClient, createConfig } from "#frontend/shared/client/client";
import { createInFlight } from "#frontend/shared/utils/concurrency/single-flight";

// Added for customizing test behavior
const defaultQueryRetries = import.meta.env.VITE_IS_E2E === "true" ? 1 : 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
      retry: defaultQueryRetries,
    },
  },
  queryCache: new QueryCache({
    onError(error, query) {
      if (query.state.data !== undefined) {
        Logger.error("Background update failed:", error);
        return;
      }

      Logger.error("Something went wrong:", error);
    },
  }),
});

// Keep copies of the incoming request bodies to retry later
// Potential to break if assumption that Request is always the same in the entire request-response lifecycle becomes false
const requestBodyDictionary = new Map<Request, Request>();
// Create new instance because deep cloning does not work with functions as properties
export const clientWithAuth = createClient(
  createConfig<ClientOptions>({
    baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
  }),
);

const refreshAccessToken: () => Promise<
  CreateRefreshTokenResponse | undefined
> = async () => {
  try {
    const result = await createRefreshToken({ credentials: "include" });
    const data = result.data;
    await queryClient.setQueryData(createRefreshTokenQueryKey(), data);

    return data;
  } catch (error) {
    Logger.error("Refresh token expired or revoked", error);
    await queryClient.setQueryData(createRefreshTokenQueryKey(), null);

    return undefined;
  }
};

const inFlightRequestNewAccessTokenFn = createInFlight(refreshAccessToken);

function withBearerToken(request: Request, accessToken: string) {
  request.headers.set("Authorization", `Bearer ${accessToken}`);
}

clientWithAuth.interceptors.request.use(async (request) => {
  const data = queryClient.getQueryData<CreateRefreshTokenResponse>(
    createRefreshTokenQueryKey(),
  );
  requestBodyDictionary.set(request, request.clone());

  if (data?.accessToken) {
    withBearerToken(request, data.accessToken);
  }

  return request;
});

clientWithAuth.interceptors.response.use(async (response, request, options) => {
  const requestCopy = requestBodyDictionary.get(request);
  requestBodyDictionary.delete(request);

  if (response.status < 400) {
    return response;
  }

  if (response.status === 401) {
    const data = await inFlightRequestNewAccessTokenFn();

    if (!data?.accessToken) {
      throw new Error("Refresh request failed to produce access token");
    }

    if (!requestCopy) {
      throw Error(
        `Old and new request in ${withBearerToken.name} do not match`,
      );
    }

    withBearerToken(requestCopy, data.accessToken);
    const retryResponse = await fetch(requestCopy);

    if (retryResponse.status >= 400) {
      const retryError = await retryResponse.json();

      throw retryError;
    }

    return retryResponse;
  }

  const error = await response.json();
  throw error;
});
