import { Page, devices, expect, test } from "@playwright/test";

const getPreview = (page: Page) =>
  page.getByRole("button", { name: "Accept invite" }).locator("..");

test("popover flip", async ({ page, headless }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.goto("/examples/popover-flip");
  await page.getByRole("button", { name: "Accept invite" }).click();
  await expect(
    page.getByRole("dialog", { name: "Team meeting" })
  ).toBeVisible();
  if (!headless) return;
  // Expect the popover to be placed on the right
  expect(await getPreview(page).screenshot()).toMatchSnapshot();
  // Resize the viewport to ensure it overflows
  await page.setViewportSize(devices["iPhone X"].viewport);
  // Expect the popover to be placed on the top
  expect(await getPreview(page).screenshot()).toMatchSnapshot();
  // Scroll the page to the end so it fallbacks to the bottom
  await page.mouse.wheel(0, 200);
  // Expect the popover to be placed on the bottom
  expect(await getPreview(page).screenshot()).toMatchSnapshot();
});
