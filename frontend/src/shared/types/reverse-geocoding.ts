import { z } from "zod";

export const reverseGeocodingResponseSchema = z.object({
  type: z.string(),
  features: z.array(
    z.object({
      type: z.string(),
      properties: z.object({
        datasource: z.object({
          sourcename: z.string(),
          attribution: z.string(),
          license: z.string(),
          url: z.string(),
        }),
        other_names: z.object({}),
        country: z.string(),
        country_code: z.string(),
        city: z.string(),
        iso3166_2: z.string(),
        lon: z.number().gte(-180).lte(180),
        lat: z.number().gte(-90).lte(180),
        distance: z.number(),
        result_type: z.string(),
        formatted: z.string(),
        address_line1: z.string(),
        address_line2: z.string(),
        category: z.string(),
        timezone: z.object({
          name: z.string(),
          offset_STD: z.string(),
          offset_STD_seconds: z.number(),
          offset_DST: z.string(),
          offset_DST_seconds: z.number(),
          abbreviation_STD: z.string(),
          abbreviation_DST: z.string(),
        }),
        plus_code: z.string(),
        plus_code_short: z.string(),
        rank: z.object({ importance: z.number(), popularity: z.number() }),
        place_id: z.string(),
      }),
      geometry: z.object({
        type: z.string(),
        coordinates: z.array(z.number()),
      }),
      bbox: z.array(z.number()),
    }),
  ),
  query: z.object({ lat: z.number(), lon: z.number(), plus_code: z.string() }),
});

export type ReverseGeocodingResponse = z.infer<
  typeof reverseGeocodingResponseSchema
>;
