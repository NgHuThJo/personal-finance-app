import { expect } from "@playwright/test";
import { test } from "../../fixtures/api";

test.describe("login", () => {
  test("login and route to dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("email").fill("someemail@email.com");
    await page.getByLabel("password").fill("password");

    await Promise.all([
      page.waitForURL("/dashboard"),
      page.getByTestId("normal-login").click(),
    ]);

    expect(page.url()).not.toContain("login");
  });

  test("login with wrong credentials", async ({ page }) => {
    await page.goto("/login");

    await page.route("**/v1/auth/login", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/problem+json",
        body: JSON.stringify({
          detail: "some error message",
          status: 401,
        }),
      }),
    );

    const email = page.getByTestId("email");
    const password = page.getByTestId("password");

    await email.getByLabel("email").fill("someemail@email.com");
    await password.getByLabel("password").fill("someinvalidpassword");
    await page.getByTestId("normal-login").click();

    await expect(password.getByTestId("server-unauthorized")).toHaveText(/.+/i);
  });

  test("login with no input", async ({ page }) => {
    await page.goto("/login");

    const email = page.getByTestId("email");
    const password = page.getByTestId("password");

    await page.getByTestId("normal-login").click();

    await expect(email.getByTestId("error")).toHaveText(/.+/i);
    await expect(password.getByTestId("error")).toHaveText(/.+/i);
  });
});
