import { test as base, type BrowserContext, type Page } from "@playwright/test";
import { zocker } from "zocker";
import { zSignUpUserRequest } from "#frontend/shared/client/zod.gen";

type Api = {
  context: BrowserContext;
  page: Page;
};

const min = 24;
const max = 24;

export const test = base.extend<Api>({
  context: async ({ browser }, use) => {
    const context = await browser.newContext();

    await context.route(`**/api/auth/signup`, (r) =>
      r.fulfill({
        json: {
          ...zocker(zSignUpUserRequest).generate(),
        },
      }),
    );
    // await context.route("https://api.geoapify.com/v1/geocode/reverse**", (r) =>
    //   r.fulfill({
    //     json: {
    //       ...zocker(reverseGeocodingResponseSchema)
    //         .array({ min, max })
    //         .override(z.ZodNumber, () => {
    //           return Math.floor(Math.random() * -20);
    //         })
    //         .generate(),
    //     },
    //   }),
    // );
    // await context.route(
    //   "https://geocoding-api.open-meteo.com/v1/search**",
    //   (r) =>
    //     r.fulfill({
    //       json: {
    //         ...zocker(geocodingSchema)
    //           .array({ min, max })
    //           .override(z.ZodNumber, () => {
    //             return Math.floor(Math.random() * 20);
    //           })
    //           .generate(),
    //       },
    //     }),
    // );

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
