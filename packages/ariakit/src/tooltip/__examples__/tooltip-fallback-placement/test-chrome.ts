import { Page, devices, expect, test } from "@playwright/test";

const getCanvas = (page: Page) =>
  page.locator(`role=button[name='Tooltip'] >> xpath=..`);

test("tooltip fallback placement", async ({ page }) => {
  await page.goto("/examples/tooltip-fallback-placement");
  // Resize the viewport to ensure it overflows for animation before focusing inside dialog
  await page.setViewportSize(devices["iPhone 8"].viewport);
  // Wait for animation before focusing inside dialog
  await expect(page.locator("role=tooltip[name='Tooltip']")).toBeVisible();
  // Wait for animation before hiding the dialog
  const canvas = await getCanvas(page);
  expect(await canvas.screenshot()).toMatchSnapshot();
});
