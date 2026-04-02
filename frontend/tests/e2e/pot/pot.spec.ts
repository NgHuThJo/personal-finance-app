import { expect } from "@playwright/test";
import { createProblemDetails, test } from "../../fixtures/api";

test.describe("pot", () => {
  test.describe("add new pot", () => {
    test("should open add new pot dialog and show no error messages after form is submitted", async ({
      page,
    }) => {
      await page.pause();
      await page.goto("/pots");
      await page.getByRole("button", { name: /add new pot/i }).click();

      await page.getByLabel("name").fill("Some random pot name");
      await page.getByLabel("target").fill("30");
      await page.getByRole("button", { name: "+Add New Pot" }).click();

      await expect(
        page.getByTestId("add-pot-server-confiict"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("add-pot-server-bad-request"),
      ).not.toBeVisible();
    });

    test("should open add new pot dialog and show error messages after form is submitted with invalid data", async ({
      page,
    }) => {
      await page.goto("/pots");
      await page.getByRole("button", { name: /add new pot/i }).click();

      const name = page.getByLabel("name");
      const target = page.getByLabel("target");

      await name.fill("");
      await target.fill("");
      await page.getByRole("button", { name: "+Add New Pot" }).click();

      await expect(page.getByTestId("name-error")).toBeVisible();
      await expect(page.getByTestId("target-error")).toBeVisible();
    });

    test("should open add new pot dialog and show error messages after server returns 400 error", async ({
      page,
    }) => {
      await page.route("**/v1/pots", async (r) => {
        const requestMethod = r.request().method();

        if (requestMethod === "POST") {
          return r.fulfill({
            status: 400,
            json: createProblemDetails({
              detail: "some error message",
              status: 400,
            }),
          });
        }

        return r.fallback({ method: "GET" });
      });

      await page.goto("/pots");
      await page.getByRole("button", { name: /add new pot/i }).click();

      const name = page.getByLabel("name");
      const target = page.getByLabel("target");

      await name.fill("somerandomname");
      await target.fill("20");
      await page.getByRole("button", { name: "+Add New Pot" }).click();

      await expect(
        page.getByTestId("add-pot-server-bad-request"),
      ).toBeVisible();
    });

    test("should open add new pot dialog and show error messages after server returns 409 error", async ({
      page,
    }) => {
      await page.route("**/v1/pots", async (r) => {
        const requestMethod = r.request().method();

        if (requestMethod === "POST") {
          return r.fulfill({
            status: 409,
            json: createProblemDetails({
              detail: "some error message",
              status: 409,
            }),
          });
        }

        return r.fallback({ method: "GET" });
      });

      await page.goto("/pots");
      await page.getByRole("button", { name: /add new pot/i }).click();

      const name = page.getByLabel("name");
      const target = page.getByLabel("target");

      await name.fill("somerandomname");
      await target.fill("20");
      await page.getByRole("button", { name: "+Add New Pot" }).click();

      await expect(page.getByTestId("add-pot-server-conflict")).toBeVisible();
    });
  });

  test.describe("add money to pot", () => {
    test("should open add money to pot dialog and show no errors after form submission", async ({
      page,
    }) => {
      await page.goto("/pots");
      await page
        .getByRole("button", { name: /add money/i })
        .first()
        .click();

      const moneyAdded = page.getByLabel("amount to add");

      await moneyAdded.fill("200");
      await page.getByRole("button", { name: /confirm addition/i }).click();

      await expect(page.getByTestId("money-added-error")).not.toBeVisible();
    });

    test("should open add money to pot and show errors after form submission with no input", async ({
      page,
    }) => {
      await page.goto("/pots");
      await page
        .getByRole("button", { name: /add money/i })
        .first()
        .click();

      const moneyAdded = page.getByLabel("amount to add");
      await moneyAdded.fill("");
      await page.getByRole("button", { name: /confirm addition/i }).click();

      await expect(page.getByTestId("money-added-error")).toBeVisible();
    });

    test("should open add money to pot dialog and show server errors after form submission with semantically invalid input", async ({
      page,
    }) => {
      await page.route("**/v1/pots/*/addition", (r) =>
        r.fulfill({
          status: 422,
          json: createProblemDetails({
            detail: "some unprocessable content error",
            status: 422,
          }),
        }),
      );

      await page.goto("/pots");
      await page
        .getByRole("button", { name: /add money/i })
        .first()
        .click();

      const moneyAdded = page.getByLabel("amount to add");
      await moneyAdded.fill("2000");
      await page.getByRole("button", { name: /confirm addition/i }).click();

      await expect(
        page.getByTestId("server-unprocessable-content"),
      ).toBeVisible();
    });
  });

  test.describe("withdraw money from pot", () => {
    test("should open withdraw money from pot dialog and show no errors after form submission with valid data", async ({
      page,
    }) => {
      await page.goto("/pots");
      await page
        .getByRole("button", { name: /withdraw/i })
        .first()
        .click();

      await page.getByLabel("amount to withdraw").fill("20");
      await page.getByRole("button", { name: /confirm withdrawal/i }).click();

      await expect(
        page.getByTestId("server-unprocessable-content"),
      ).not.toBeVisible();
    });

    test("should open withdraw money from pot dialog and show errors after form submission with no data", async ({
      page,
    }) => {
      await page.goto("/pots");
      await page
        .getByRole("button", { name: /withdraw/i })
        .first()
        .click();

      await page.getByLabel("amount to withdraw").fill("");
      await page.getByRole("button", { name: /confirm withdrawal/i }).click();

      await expect(page.getByTestId("withdraw-money-error")).toBeVisible();
    });

    test("should open withdraw money from pot dialog and show server errors after form submission with semantically invalid data", async ({
      page,
    }) => {
      await page.route("**/v1/pots/*/withdrawal", (r) =>
        r.fulfill({
          status: 422,
          json: createProblemDetails({
            detail: "some problemdetails error",
            status: 422,
          }),
        }),
      );

      await page.goto("/pots");
      await page
        .getByRole("button", { name: /withdraw/i })
        .first()
        .click();

      await page.getByLabel("amount to withdraw").fill("200");
      await page.getByRole("button", { name: /confirm withdrawal/i }).click();

      await expect(
        page.getByTestId("server-unprocessable-content"),
      ).toBeVisible();
    });
  });

  test.describe("edit pot", () => {
    test("should open edit pot dialog and show no errors after form submission with valid data", async ({
      page,
    }) => {
      await page.goto("/pots");

      await page.getByTestId("popover").first().click();
      await page.getByRole("button", { name: /edit pot/i }).click();

      await page.getByLabel(/pot name/i).fill("some random valid name");
      await page.getByLabel(/target amount/i).fill("20");
      await page.getByTestId("edit-pot-submit-button").first().click();

      await expect(page.getByTestId("edit-pot-potname-error")).toBeVisible();
    });
  });
});
