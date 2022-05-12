import { Page, devices, expect, test } from "@playwright/test";

const getPreviewContainer = (page: Page) =>
  page.locator("role=button[name='Accept invite'] >> xpath=..");

test("popover flip", async ({ page }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.goto("/examples/popover-flip");
  await page.locator("role=button[name='Accept invite']").click();
  await expect(page.locator("role=dialog[name='Team meeting']")).toBeVisible();
  // Expect the popover to be placed on the right
  expect(await getPreviewContainer(page).screenshot()).toMatchSnapshot();
  // Resize the viewport to ensure it overflows
  await page.setViewportSize(devices["iPhone X"].viewport);
  // Expect the popover to be placed on the top
  expect(await getPreviewContainer(page).screenshot()).toMatchSnapshot();
  // Scroll the page to the end so it fallbacks to the bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // Expect the popover to be placed on the bottom
  expect(await getPreviewContainer(page).screenshot()).toMatchSnapshot();
});
