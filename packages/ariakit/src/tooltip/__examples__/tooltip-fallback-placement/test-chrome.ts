import { Page, devices, expect, test } from "@playwright/test";

const getCanvas = (page: Page) =>
  page.locator(`role=button[name='Tooltip'] >> xpath=..`);

test("tooltip fallback placement", async ({ page }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.goto("/examples/tooltip-fallback-placement");
  // Resize the viewport to ensure it overflows
  await page.setViewportSize(devices["iPhone 8"].viewport);
  await expect(page.locator("role=tooltip[name='Tooltip']")).toBeVisible();
  const canvas = await getCanvas(page);
  // Expect the tooltip to be placed on the bottom
  expect(await canvas.screenshot()).toMatchSnapshot();
});
