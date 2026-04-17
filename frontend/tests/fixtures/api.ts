import { test as base } from "@playwright/test";
import { zocker } from "zocker";
import {
  zGetAllBudgetsResponse,
  zGetAllCategoriesResponse,
  zGetAllPotsResponse,
  zGetAllTransactionsResponse,
  zGetAllTransactionsTransactionDto,
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

export const test = base.extend<{
  gotoWithQueryParams: (
    page: string,
    queryParams: Record<string, string | number | boolean | undefined>,
  ) => Promise<void>;
}>({
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
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.b8VqsrBMZJ8wCWpKyWD9DLgW1mR06HEkxWQAwaQN8Sw",
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
            themeColor: "Army",
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

    // Budget
    await context.route(`**/v1/budgets`, (r) => {
      let idCounter = 1;

      return r.fulfill({
        status: 200,
        json: zocker(zGetAllBudgetsResponse)
          .supply(zGetAllBudgetsResponse, {
            id: ++idCounter,
            category: "Bills",
            themeColor: "Army",
            maximum: 200,
          })
          .generateMany(3),
      });
    });

    // Transaction
    await context.route(`**/v1/transactions?**`, (r) => {
      let idCounter = 1;

      return r.fulfill({
        status: 200,
        json: zocker(zGetAllTransactionsResponse)
          .supply(zGetAllTransactionsResponse, {
            data: zocker(zGetAllTransactionsTransactionDto)
              .supply(zGetAllTransactionsTransactionDto, {
                id: ++idCounter,
                category: "Bills",
                amount: 200,
                isRecurring: false,
                otherUser: {
                  email: "somerandom@email.com",
                  name: "somerandomname",
                },
                senderId: ++idCounter,
                recipientId: ++idCounter,
                transactionDate: Date(),
              })
              .generateMany(4),
            transactionCount: 4,
          })
          .generate(),
      });
    });

    await context.route(`**/v1/transactions`, (r) => {
      let idCounter = 1;

      return r.fulfill({
        status: 200,
        json: zocker(zGetAllTransactionsResponse)
          .supply(zGetAllTransactionsResponse, {
            data: zocker(zGetAllTransactionsTransactionDto)
              .supply(zGetAllTransactionsTransactionDto, {
                id: ++idCounter,
                category: "Bills",
                amount: 200,
                isRecurring: false,
                otherUser: {
                  email: "somerandom@email.com",
                  name: "somerandomname",
                },
                senderId: ++idCounter,
                recipientId: ++idCounter,
                transactionDate: Date(),
              })
              .generateMany(4),
            transactionCount: 4,
          })
          .generate(),
      });
    });

    await context.route("**/v1/transactions", (r) => {
      if (r.request().method() === "PUT") {
        return r.fulfill({
          status: 204,
        });
      }

      return r.fallback({
        method: "GET",
      });
    });

    // Category
    await context.route("**/v1/categories", (r) =>
      r.fulfill({
        json: zocker(zGetAllCategoriesResponse)
          .supply(zGetAllCategoriesResponse, ["Bills"])
          .generate(),
      }),
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);

    await context.close();
  },
  gotoWithQueryParams: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(
      async (
        path: string,
        queryParams: Record<string, string | number | boolean | undefined>,
      ) => {
        const url = new URL(path, "https://localhost:5173");

        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.set(key, value.toString());
          }
        });

        await page.goto(url.toString());
      },
    );
  },
  // page: async ({ page }, use) => {
  //   // page.on("requestfailed", (req) => {
  //   //   console.log(req.url(), req.failure()?.errorText);
  //   // });
  //   // page.on("console", (msg) => {
  //   //   console.log("app log:", msg.location(), msg.text());
  //   // });
  //   // page.on("request", (r) => console.log("REQ:", r.url()));
  //   // await use(page);
  // },
});
