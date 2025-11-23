import { queryOptions } from "@tanstack/react-query";
import { fetchData } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import { geocodingSchema } from "#frontend/shared/types/geocoding";

const geocodingParams = {
  name: "",
  count: 10,
  language: "en",
  format: "json",
};

export const autocompleteKeys = {
  all: (searchInput: string) => ["autocomplete", searchInput],
};

export const autocompleteOptions = {
  getLocations: (searchInput: string) =>
    queryOptions({
      queryKey: autocompleteKeys.all(searchInput),
      queryFn: async ({ signal }) => {
        const url = import.meta.env.VITE_METEO_GEOCODING_BASE_URL;
        const queryString = new URLSearchParams(
          Object.entries(geocodingParams)
            .map((pair) => pair.join("="))
            .join("&"),
        );
        queryString.set("name", searchInput);

        const data = await fetchData(`${url}?${queryString.toString()}`, {
          signal,
        });

        const validatedData = geocodingSchema.safeParse(data);

        if (!validatedData.success) {
          Logger.debug("Autocomplete error", validatedData.error);
          throw new Error("Geocoding api schema does not match expectations");
        }

        return validatedData.data;
      },
    }),
};
