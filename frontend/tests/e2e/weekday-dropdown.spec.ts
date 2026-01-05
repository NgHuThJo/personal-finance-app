// import { expect } from "@playwright/test";
// import { test } from "../fixtures/open-meteo-api";

// test.describe("weekday dropdown", () => {
//   test("change weekday value on click", async ({ page }) => {
//     await page.goto("http://localhost:5173/");

//     const weekdayButton = page.getByTestId("weekday-button");
//     await weekdayButton.click();

//     const mondayButton = page.getByRole("menuitemradio", {
//       name: "monday",
//     });
//     await mondayButton.click();

//     await expect(weekdayButton).toHaveText(/monday/i);

//     await weekdayButton.click();

//     const tuesdayButton = page.getByRole("menuitemradio", {
//       name: "tuesday",
//     });
//     await tuesdayButton.click();

//     await expect(weekdayButton).toHaveText(/tuesday/i);
//   });
// });
