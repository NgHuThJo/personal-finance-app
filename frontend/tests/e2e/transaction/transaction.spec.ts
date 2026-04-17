import { expect } from "@playwright/test";
import { createProblemDetails, test } from "../../fixtures/api";

test.describe("transaction", () => {
  test.describe("add new transaction", () => {
    test("should show no errors after successful form submission", async ({
      page,
    }) => {
      await page.goto("/transactions");
      await page.getByRole("button", { name: /add new transaction/i }).click();

      await page.getByLabel("transaction email").fill("somerandom@email.com");
      await page.getByLabel("transaction date").fill("2020-02-02");
      await page.getByLabel("category").click();
      await page.getByRole("option", { name: "bills" }).click();
      await page.getByLabel("amount").fill("1000");
      await page.getByRole("button", { name: "+add new transaction" }).click();

      await expect(page.getByTestId("recipient-email-error")).not.toBeVisible();
      await expect(
        page.getByTestId("transaction-amount-error"),
      ).not.toBeVisible();
    });

    test("should show errors in case of malformed input", async ({ page }) => {
      await page.goto("/transactions");
      await page.getByRole("button", { name: /add new transaction/i }).click();

      await page.getByLabel("transaction email").fill("");
      await page.getByLabel("transaction date").fill("");
      await page.getByLabel("amount").fill("");
      await page.getByRole("button", { name: "+add new transaction" }).click();

      await expect(page.getByTestId("recipient-email-error")).toBeVisible();
      await expect(page.getByTestId("transaction-date-error")).toBeVisible();
      await expect(page.getByTestId("transaction-amount-error")).toBeVisible();
    });

    test("should show server errors", async ({ page }) => {
      await page.route("**/v1/transactions", (r) =>
        r.fulfill({
          status: 400,
          json: createProblemDetails({
            detail: "some bad request",
            status: 400,
          }),
        }),
      );
      await page.goto("/transactions");
      await page.getByRole("button", { name: /add new transaction/i }).click();

      await page.getByLabel("transaction email").fill("somerandom@email.com");
      await page.getByLabel("transaction date").fill("2020-02-02");
      await page.getByLabel("category").click();
      await page.getByRole("option", { name: "bills" }).click();
      await page.getByLabel("amount").fill("1000");
      await page.getByRole("button", { name: "+add new transaction" }).click();

      await expect(page.getByTestId("server-bad-request")).toBeVisible();
    });
  });
});
