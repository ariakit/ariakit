import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page | Locator, name: string) =>
  page.getByRole("button", { name });
const getPopover = (page: Page | Locator) =>
  page.getByRole("dialog", { name: "Team meeting" });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/popover-standalone", { waitUntil: "networkidle" });
});

test("do not scroll when opening the popover", async ({ page }) => {
  await getButton(page, "Accept invite").focus();
  const prevScrollY = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Enter");
  await expect(getPopover(page)).toBeVisible();
  await expect(getButton(getPopover(page), "Accept")).toBeFocused();
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(prevScrollY);
});
