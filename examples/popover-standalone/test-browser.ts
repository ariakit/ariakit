import { Locator, Page, expect, test } from "@playwright/test";

const getButton = (page: Page | Locator, name: string) =>
  page.getByRole("button", { name });
const getPopover = (page: Page | Locator) =>
  page.getByRole("dialog", { name: "Team meeting" });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/popover-standalone");
});

test("do not scroll when opening the popover", async ({ page }) => {
  await getButton(page, "Accept invite").focus();
  const prevScrollY = await page.evaluate(() => window.scrollY);
  await expect(async () => {
    await page.keyboard.press("Enter");
    await expect(getPopover(page)).toBeVisible();
  }).toPass();
  await expect(getButton(getPopover(page), "Accept")).toBeFocused();
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(prevScrollY);
});
