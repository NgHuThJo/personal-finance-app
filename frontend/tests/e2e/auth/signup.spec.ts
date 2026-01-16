import { expect } from "@playwright/test";
import { test } from "../../fixtures/api";

test.describe("signup", () => {
  test("sign up and redirect to login route", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("email").fill("someemail@email.com");
    await page.getByLabel("name").fill("SomeName");
    await page.getByLabel("password").fill("password");

    const submitButton = page.getByRole("button", {
      name: "create account",
    });
    await Promise.all([page.waitForURL("/login"), submitButton.click()]);

    expect(page.url()).not.toContain("signup");
  });

  test("do not enter anything and show validation errors", async ({ page }) => {
    await page.goto("/signup");

    const name = page.getByTestId("label-name");
    const email = page.getByTestId("label-email");
    const password = page.getByTestId("label-password");
    const submitButton = page.getByRole("button", {
      name: "create account",
    });

    await name.getByLabel("name").fill("");
    await email.getByLabel("email").fill("");
    await password.getByLabel("password").fill("");

    await submitButton.click();

    await expect(name.getByTestId("error")).toHaveText(/.+/i);
    await expect(email.getByTestId("error")).toHaveText(/.+/i);
    await expect(password.getByTestId("error")).toHaveText(/.+/i);
  });

  test("show server error message if email already exists after submit", async ({
    page,
  }) => {
    await page.goto("/signup");

    await page.route("**/api/auth/signup", (r) =>
      r.fulfill({
        status: 409,
        body: JSON.stringify({
          detail: "email is already in use",
          status: 401,
        }),
      }),
    );

    const name = page.getByTestId("label-name");
    const email = page.getByTestId("label-email");
    const password = page.getByTestId("label-password");
    const submitButton = page.getByRole("button", {
      name: "create account",
    });

    await name.getByLabel("name").fill("somevalidname");
    await email.getByLabel("email").fill("email@email.com");
    await password.getByLabel("password").fill("validpassword");

    await submitButton.click();

    await expect(email.getByTestId("server-conflict")).toHaveText(/.+/i);
  });
});
