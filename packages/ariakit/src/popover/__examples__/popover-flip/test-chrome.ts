import { devices, expect, test } from "@playwright/test";

test("popover flip", async ({ page }, testInfo) => {
  testInfo.snapshotSuffix = "";
  // Resize the viewport to ensure it overflows
  await page.setViewportSize(devices["iPhone 8"].viewport);
  await page.goto("/examples/popover-flip");
  await expect(page.locator("role=dialog[name='Team meeting']")).toBeVisible();
  // Expect the popover to be placed on the bottom
  expect(await page.screenshot()).toMatchSnapshot();
});
