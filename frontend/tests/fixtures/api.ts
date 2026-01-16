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
  // context: async ({ browser }, use) => {
  //   console.log("in test context");
  //   const context = await browser.newContext();

  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   await use(context);

  //   await context.close();
  // },
  page: async ({ page }, use) => {
    await page.route(`**/api/auth/signup`, (r) =>
      r.fulfill({
        json: {
          ...zocker(zSignUpUserRequest).generate(),
        },
      }),
    );

    await page.route(`**/api/auth/login`, (r) =>
      r.fulfill({
        json: {
          ...zocker(zLoginUserRequest).generate(),
        },
      }),
    );
    // page.on("requestfailed", (req) => {
    //   console.log(req.url(), req.failure()?.errorText);
    // });

    // page.on("request", (r) => console.log("REQ:", r.url()));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);

    await page.close();
  },
});
