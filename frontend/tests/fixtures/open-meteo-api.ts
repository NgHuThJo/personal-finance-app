import { test as base, BrowserContext, Page } from "@playwright/test";
import { zocker } from "zocker";
import z from "zod";
import { geocodingSchema } from "../../src/shared/types/geocoding";
import { reverseGeocodingResponseSchema } from "../../src/shared/types/reverse-geocoding";
import { weatherSchema } from "../../src/shared/types/weather";

type MockWeatherApi = {
  context: BrowserContext;
  page: Page;
};

const min = 24;
const max = 24;

export const test = base.extend<MockWeatherApi>({
  context: async ({ browser }, use) => {
    const context = await browser.newContext();

    await context.route("https://api.open-meteo.com/v1/forecast**", (r) => {
      r.fulfill({
        json: {
          ...zocker(weatherSchema)
            .array({ min, max })
            .override(z.ZodNumber, () => {
              return Math.floor(Math.random() * 20);
            })
            .generate(),
        },
      });
    });
    await context.route("https://api.geoapify.com/v1/geocode/reverse**", (r) =>
      r.fulfill({
        json: {
          ...zocker(reverseGeocodingResponseSchema)
            .array({ min, max })
            .override(z.ZodNumber, () => {
              return Math.floor(Math.random() * -20);
            })
            .generate(),
        },
      }),
    );
    await context.route(
      "https://geocoding-api.open-meteo.com/v1/search**",
      (r) =>
        r.fulfill({
          json: {
            ...zocker(geocodingSchema)
              .array({ min, max })
              .override(z.ZodNumber, () => {
                return Math.floor(Math.random() * 20);
              })
              .generate(),
          },
        }),
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);

    await context.close();
  },
  page: async ({ context }, use) => {
    const page = await context.newPage();

    page.on("requestfailed", (req) => {
      console.log(req.url(), req.failure()?.errorText);
    });

    // page.on("request", (r) => console.log("REQ:", r.url()));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);

    await page.close();
  },
});
