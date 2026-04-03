import { test as base } from "@playwright/test";
import { zocker } from "zocker";
import {
  zGetAllPotsResponse,
  zGetBalanceByUserIdResponse,
  zLoginUserResponse,
  zSignUpUserResponse,
} from "#frontend/shared/client/zod.gen";

type ProblemDetails = {
  title?: string;
  detail: string;
  status: number;
  type?: string;
  instance?: string;
};

export const createProblemDetails = (problems: ProblemDetails) => problems;

export const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext();

    // Auth
    await context.route(`**/v1/auth/signup`, (r) =>
      r.fulfill({
        json: {
          ...zocker(zSignUpUserResponse).generate(),
        },
      }),
    );

    await context.route(`**/v1/auth/refresh`, (r) =>
      r.fulfill({
        json: {
          accessToken: "access-token-from-refresh-token",
        },
        status: 200,
      }),
    );

    await context.route(`**/v1/auth/login`, (r) =>
      r.fulfill({
        body: zocker(zLoginUserResponse).generate(),
        status: 200,
      }),
    );

    // Pot
    await context.route(`**/v1/pots`, (r) => {
      let idCounter = 1;

      return r.fulfill({
        json: zocker(zGetAllPotsResponse)
          .supply(zGetAllPotsResponse, {
            id: ++idCounter,
            name: "some-random-name",
            target: 1000,
            total: 500,
          })
          .generateMany(3),
        status: 200,
      });
    });

    await context.route("**/v1/pots/*", (r) => {
      if (r.request().method() === "DELETE") {
        return r.fulfill({
          status: 204,
        });
      }

      return r.fallback();
    });

    await context.route("**/v1/pots/*", (r) => {
      if (r.request().method() === "PUT") {
        return r.fulfill({
          status: 204,
        });
      }

      return r.fallback();
    });

    await context.route(`**/v1/pots/*/addition`, (r) =>
      r.fulfill({
        status: 204,
      }),
    );

    await context.route(`**/v1/pots/*/withdrawal`, (r) =>
      r.fulfill({
        status: 204,
      }),
    );

    // Balance
    await context.route(`**/v1/balances/me`, (r) =>
      r.fulfill({
        json: zocker(zGetBalanceByUserIdResponse)
          .supply(zGetBalanceByUserIdResponse, {
            current: 1000,
            expense: 500,
            income: 750,
          })
          .generate(),
        status: 200,
      }),
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);

    await context.close();
  },
  // page: async ({ page }, use) => {
  //   page.on("requestfailed", (req) => {
  //     console.log(req.url(), req.failure()?.errorText);
  //   });

  //   page.on("console", (msg) => {
  //     console.log("app log:", msg.location(), msg.text());
  //   });
  //   // page.on("request", (r) => console.log("REQ:", r.url()));
  //   await use(page);
  // },
});
