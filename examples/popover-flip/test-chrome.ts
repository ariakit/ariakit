import { expect, test } from "@playwright/test";

test("popover flip", async ({ page }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.goto("/previews/popover-flip");
  await page.getByRole("button", { name: "Accept invite" }).click();
  await expect(
    page.getByRole("dialog", { name: "Team meeting" })
  ).toBeVisible();
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
