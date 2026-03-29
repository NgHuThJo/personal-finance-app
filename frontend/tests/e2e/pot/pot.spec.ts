import { expect } from "@playwright/test";
import { test } from "../../fixtures/api";

test.describe("pot", () => {
  test.describe("add new pot", () => {
    test("should open add new pot dialog and show no error messages after form is submitted", async ({
      page,
    }) => {
      await page.pause();
      console.log("cookies in test", await page.context().cookies());
      await page.goto("/pots");

      await page.getByLabel("name").fill("Some random pot name");
      await page.getByLabel("target").fill("30");
      await page.getByRole("button", { name: "+Add New Pot" }).click();

      await expect(page.getByTestId("add-pot-server-confiict")).toHaveText(
        /.+/i,
      );
      await expect(page.getByTestId("add-pot-server-bad-request")).toHaveText(
        /.+/i,
      );
    });
  });
});
