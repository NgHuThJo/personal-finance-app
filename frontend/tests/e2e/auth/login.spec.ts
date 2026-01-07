import { test } from "../../fixtures/open-meteo-api";

test.describe("searchbar", () => {
  test("login and route to dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("email").fill("someemail@email.com");
    await page.getByLabel("password").fill("password");

    await Promise.all([
      page.waitForURL("/dashboard"),
      page.getByRole("button", { name: "login" }),
    ]);
  });
});
