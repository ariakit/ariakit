import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page) =>
  page.getByRole("combobox", { name: "Favorite food" });
const getPopover = (page: Page) =>
  page.getByRole("listbox", { name: "Favorite food" });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/select-group");
});

test("scroll into view", async ({ page }) => {
  test.info().snapshotSuffix = "";
  await getButton(page).click();
  await expect(getPopover(page)).toBeFocused();
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("ArrowDown");
  }
  expect(await getPopover(page).screenshot()).toMatchSnapshot();
});

test("do not scroll when opening the popover", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.evaluate(() => (document.body.style.paddingTop = "250px"));
  await getButton(page).click();
  await expect(getPopover(page)).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(getPopover(page)).not.toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 350 }));
  await getButton(page).click();
  await expect(getPopover(page)).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(350);
});
