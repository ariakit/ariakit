import { Locator, Page, expect, test } from "@playwright/test";

const getButton = (page: Page | Locator, name: string) =>
  page.locator(`role=button[name='${name}']`);
const getPopover = (page: Page | Locator) =>
  page.locator("role=dialog[name='Team meeting']");

test("do not scroll when opening the popover", async ({ page }) => {
  await page.goto("/examples/popover-standalone");
  await getButton(page, "Accept invite").focus();
  const prevScrollY = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Enter");
  const popover = await getPopover(page);
  await expect(popover).toBeVisible();
  await expect(getButton(popover, "Accept")).toBeFocused();
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(prevScrollY);
});
