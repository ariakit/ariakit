import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/popover-flip");
});

test("popover flip", async ({ page }) => {
  test.info().snapshotSuffix = "";
  await expect(async () => {
    await page.getByRole("button", { name: "Accept invite" }).click();
    await expect(
      page.getByRole("dialog", { name: "Team meeting" })
    ).toBeVisible();
  }).toPass();
  // Expect the popover to be placed on the right
  expect(await page.screenshot()).toMatchSnapshot();
  // Resize the viewport to ensure it overflows
  await page.setViewportSize({ width: 480, height: 1024 });
  // Expect the popover to be placed on the top
  expect(await page.screenshot()).toMatchSnapshot();
  // Scroll the page to the end so it fallbacks to the bottom
  await page.evaluate(() => window.scrollTo(0, 200));
  // Expect the popover to be placed on the bottom
  expect(await page.screenshot()).toMatchSnapshot();
});
