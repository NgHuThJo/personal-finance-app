import { test as base } from "@playwright/test";
import { zocker } from "zocker";
import {
  zLoginUserRequest,
  zSignUpUserRequest,
} from "#frontend/shared/client/zod.gen";

// type Api = {
//   context: BrowserContext;
//   page: Page;
// };

const min = 24;
const max = 24;

export const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext();

    await context.route(`**/api/auth/signup`, (r) =>
      r.fulfill({
        json: {
          ...zocker(zSignUpUserRequest).generate(),
        },
      }),
    );

    await context.route(`**/api/auth/refresh`, (r) =>
      r.fulfill({
        status: 401,
      }),
    );

    await context.route(`**/api/auth/login`, (r) =>
      r.fulfill({
        json: {
          ...zocker(zLoginUserRequest).generate(),
        },
      }),
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);

    await context.close();
  },
  // page: async ({ page }, use) => {
  // page.on("requestfailed", (req) => {
  //   console.log(req.url(), req.failure()?.errorText);
  // });

  // page.on("request", (r) => console.log("REQ:", r.url()));

  // },
});
