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
