// import { expect } from "@playwright/test";
// import { test } from "../fixtures/open-meteo-api";

// test.describe("searchbar", () => {
//   test("get suggestion and render it", async ({ page }) => {
//     await page.goto("http://localhost:5173/");

//     const cityAndCountryName = page.getByTestId(
//       "current-hero-city-and-country-name",
//     );
//     const currentCityAndCountryName = await cityAndCountryName.innerText();
//     const searchInput = page.getByRole("textbox");
//     await searchInput.fill("Paris");

//     const searchButton = page.getByRole("button", {
//       name: "search",
//     });
//     await searchButton.click();

//     await expect(cityAndCountryName).not.toHaveText(currentCityAndCountryName);
//   });
// });
