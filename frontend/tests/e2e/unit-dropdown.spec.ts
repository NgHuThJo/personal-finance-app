// import { expect } from "@playwright/test";
// import { test } from "../fixtures/open-meteo-api";

// test.describe("unit dropdown", () => {
//   test("change system of measurement", async ({ page }) => {
//     await page.goto("http://localhost:5173/");

//     const currentFeelsLikeTemperature = page
//       .getByTestId("current-list-item")
//       .filter({ hasText: "feels like" });
//     const currentHeroTemperature = page.getByTestId("current-hero-temperature");
//     const dailyTemperature = page.getByTestId("daily-list-item").first();
//     const hourlyTemperature = page.getByTestId("hourly-list-item").first();
//     const currentWindSpeed = page.getByTestId("current-list-item").filter({
//       hasText: "wind",
//     });
//     const currentPrecipitation = page
//       .getByTestId("current-list-item")
//       .filter({ hasText: "precipitation" });

//     await expect(currentFeelsLikeTemperature).toHaveText(/.+°C$/i);
//     await expect(currentHeroTemperature).toHaveText(/.+°C$/i);
//     await expect(dailyTemperature).toHaveText(/.+°C$/i);
//     await expect(hourlyTemperature).toHaveText(/.+°C$/i);
//     await expect(currentWindSpeed).toHaveText(/.+km\/h$/i);
//     await expect(currentPrecipitation).toHaveText(/.+mm$/i);

//     const unitButton = page.getByRole("button", {
//       name: "unit icon Units dropdown icon",
//     });
//     await unitButton.click();

//     const metricSwitchButton = page.getByRole("menuitem", {
//       name: "Switch to Imperial",
//     });
//     await metricSwitchButton.click();
//     await page.pause();

//     await expect(currentFeelsLikeTemperature).toHaveText(/.+°F$/i);
//     await expect(currentHeroTemperature).toHaveText(/.+°F$/i);
//     await expect(dailyTemperature).toHaveText(/.+°F$/i);
//     await expect(hourlyTemperature).toHaveText(/.+°F$/i);
//     await expect(currentWindSpeed).toHaveText(/.+mp\/h$/i);
//     await expect(currentPrecipitation).toHaveText(/.+inch$/i);
//   });

//   test("change individual temperature units", async ({ page }) => {
//     await page.goto("http://localhost:5173/");

//     const currentFeelsLikeTemperature = page
//       .getByTestId("current-list-item")
//       .filter({ hasText: "feels like" });
//     const currentHeroTemperature = page.getByTestId("current-hero-temperature");
//     const dailyTemperature = page.getByTestId("daily-list-item").first();
//     const hourlyTemperature = page.getByTestId("hourly-list-item").first();

//     await expect(currentFeelsLikeTemperature).toHaveText(/.+°C$/i);
//     await expect(currentHeroTemperature).toHaveText(/.+°C$/i);
//     await expect(dailyTemperature).toHaveText(/.+°C$/i);
//     await expect(hourlyTemperature).toHaveText(/.+°C$/i);

//     const unitButton = page.getByRole("button", {
//       name: "unit icon Units dropdown icon",
//     });
//     await unitButton.click();

//     const fahrenheitSwitchButton = page.getByRole("menuitemcheckbox", {
//       name: "fahrenheit (°f)",
//     });
//     await fahrenheitSwitchButton.click();

//     await expect(currentFeelsLikeTemperature).toHaveText(/.+°F$/i);
//     await expect(currentHeroTemperature).toHaveText(/.+°F$/i);
//     await expect(dailyTemperature).toHaveText(/.+°F$/i);
//     await expect(hourlyTemperature).toHaveText(/.+°F$/i);

//     await unitButton.click();
//     const celsiusSwitchButton = page.getByRole("menuitemcheckbox", {
//       name: "celsius (°c)",
//     });
//     await celsiusSwitchButton.click();

//     await expect(currentFeelsLikeTemperature).toHaveText(/.+°C$/i);
//     await expect(currentHeroTemperature).toHaveText(/.+°C$/i);
//     await expect(dailyTemperature).toHaveText(/.+°C$/i);
//     await expect(hourlyTemperature).toHaveText(/.+°C$/i);
//   });

//   test("change individual windspeed units", async ({ page }) => {
//     await page.goto("http://localhost:5173/");

//     const currentWindSpeed = page
//       .getByTestId("current-list-item")
//       .filter({ hasText: "wind" });

//     await expect(currentWindSpeed).toHaveText(/.+km\/h$/i);

//     const unitButton = page.getByRole("button", {
//       name: "unit icon Units dropdown icon",
//     });
//     await unitButton.click();

//     const mphSwitchButton = page.getByRole("menuitemcheckbox", {
//       name: "mph",
//     });
//     await mphSwitchButton.click();

//     await expect(currentWindSpeed).toHaveText(/.+mp\/h$/i);
//   });

//   test("change individual precipitation units", async ({ page }) => {
//     await page.goto("http://localhost:5173/");

//     const currentPrecipitation = page
//       .getByTestId("current-list-item")
//       .filter({ hasText: "precipitation" });

//     await expect(currentPrecipitation).toHaveText(/.+mm$/i);

//     const unitButton = page.getByRole("button", {
//       name: "unit icon Units dropdown icon",
//     });
//     await unitButton.click();

//     const inchSwitchButton = page.getByRole("menuitemcheckbox", {
//       name: "in",
//     });
//     await inchSwitchButton.click();

//     await expect(currentPrecipitation).toHaveText(/.+inch$/i);
//   });
// });
