import { expect } from "@playwright/test";
import { zocker } from "zocker";
import { createProblemDetails, test } from "../../fixtures/api";
import { zGetAllBudgetsResponse } from "#frontend/shared/client/zod.gen";

test.describe("budget", () => {
  test.describe("create budget", () => {
    test("should open budget dialog and show new budget card after successful form submission", async ({
      page,
    }) => {
      await page.goto("/budgets");
      const listItems = page.getByRole("list").getByTestId("budget-card");
      await expect(listItems.last()).toBeVisible();
      const listItemCount = await listItems.count();

      await page.route(`**/v1/budgets`, (r) => {
        let idCounter = 1;

        return r.fulfill({
          status: 200,
          json: zocker(zGetAllBudgetsResponse)
            .supply(zGetAllBudgetsResponse, {
              id: ++idCounter,
              category: "bills",
              maximum: 200,
            })
            .generateMany(4),
        });
      });

      await page.getByRole("button", { name: /add new budget/i }).click();
      await page.getByLabel("category").click();
      await page.getByRole("option", { name: /bills/i }).click();
      await page.getByLabel("Maximum Spend").fill("200");

      await page.getByRole("button", { name: /add new budget/i }).click();

      await expect(listItems).toHaveCount(listItemCount + 1);
    });

    test("should open budget dialog and show error message for invalid form submission", async ({
      page,
    }) => {
      await page.goto("/budgets");

      await page.getByRole("button", { name: /add new budget/i }).click();
      await page.getByLabel("category").click();
      await page.getByRole("option", { name: /bills/i }).click();
      await page.getByLabel("Maximum Spend").fill("");

      await page.getByRole("button", { name: /add new budget/i }).click();

      await expect(page.getByTestId("maximum-error")).toBeVisible();
    });

    test("should show server error for invalid form submission", async ({
      page,
    }) => {
      await page.goto("/budgets", {
        waitUntil: "networkidle",
      });

      await page.route("**/v1/budgets", (r) =>
        r.fulfill({
          status: 400,
          json: createProblemDetails({
            detail: "bad request",
            status: 400,
          }),
        }),
      );

      await page.getByRole("button", { name: /add new budget/i }).click();
      await page.getByLabel("category").click();
      await page.getByRole("option", { name: /bills/i }).click();
      await page.getByLabel("Maximum Spend").fill("200");
      await page.getByRole("button", { name: /add new budget/i }).click();

      await expect(
        page.getByTestId("add-budget-server-bad-request"),
      ).toBeVisible();
    });
  });

  test.describe("edit budget", () => {
    test("should show updated budget card after successful form submission", async ({
      page,
    }) => {
      await page.goto("/budgets", {
        waitUntil: "networkidle",
      });

      await page.getByTestId("popover").first().click();
      await page.getByRole("button", { name: /edit budget/i }).click();
      await page.getByLabel("category").click();
      await page.getByRole("option", { name: /bills/i }).click();
      await page.getByLabel("Maximum Spend").fill("2000");
      await page.getByRole("button", { name: /submit/i }).click();

      await expect(page.getByTestId("maximum-error")).not.toBeVisible();
    });

    test("should show error message after submitting invalid form", async ({
      page,
    }) => {
      await page.goto("/budgets", {
        waitUntil: "networkidle",
      });

      await page.getByTestId("popover").first().click();
      await page.getByRole("button", { name: /edit budget/i }).click();
      await page.getByLabel("category").click();
      await page.getByRole("option", { name: /bills/i }).click();
      await page.getByLabel("Maximum Spend").fill("");
      await page.getByRole("button", { name: /submit/i }).click();

      await expect(page.getByTestId("maximum-error")).toBeVisible();
    });

    test("should show server error after returning from api request", async ({
      page,
    }) => {
      await page.goto("/budgets", {
        waitUntil: "networkidle",
      });

      await page.route("**/v1/budgets", (r) =>
        r.fulfill({
          status: 400,
          json: createProblemDetails({
            detail: "bad request",
            status: 400,
          }),
        }),
      );

      await page.getByTestId("popover").first().click();
      await page.getByRole("button", { name: /edit budget/i }).click();
      await page.getByLabel("category").click();
      await page.getByRole("option", { name: /bills/i }).click();
      await page.getByLabel("Maximum Spend").fill("200");
      await page.getByRole("button", { name: /submit/i }).click();

      await expect(page.getByTestId("server-bad-request")).toBeVisible();
    });
  });

  test.describe("delete budget", () => {
    test("should delete budget", async ({ page }) => {
      await page.goto("/budgets", {
        waitUntil: "networkidle",
      });

      await page.getByTestId("popover").first().click();
      await page.getByRole("button", { name: /delete budget/i }).click();
      await page
        .getByRole("button", { name: /yes, confirm deletion/i })
        .click();

      await expect(page.getByTestId("server-bad-request")).not.toBeVisible();
    });
  });

  test.describe("open delete budget and then close it", () => {
    test("should delete budget", async ({ page }) => {
      await page.goto("/budgets", {
        waitUntil: "networkidle",
      });

      await page.getByTestId("popover").first().click();
      await page.getByRole("button", { name: /delete budget/i }).click();
      await page.getByRole("button", { name: /no, go back/i }).click();

      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });
});
