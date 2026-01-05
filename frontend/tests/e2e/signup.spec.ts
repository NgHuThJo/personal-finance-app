import { expect } from "@playwright/test";
import { test } from "../fixtures/open-meteo-api";

test.describe("signup", () => {
  test("sign up and redirect to login route", async ({ page }) => {
    await page.goto("/signup");

    const emailInputField = await page
      .getByLabel("email")
      .fill("someemail@email.com");
    const nameInputField = await page.getByLabel("name").fill("SomeName");
    const passwordInputField = await page
      .getByLabel("password")
      .fill("password");

    const submitButton = page.getByRole("button", {
      name: "create account",
    });
    await Promise.all([page.waitForURL("/login"), submitButton.click()]);

    expect(page.url()).not.toContain("signup");
  });
});
