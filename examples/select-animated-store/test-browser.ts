import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page) =>
  page.getByRole("combobox", { name: "Favorite fruit" });

const getPopover = (page: Page) =>
  page.getByRole("listbox", { name: "Favorite fruit" });

const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name });

const expectActiveOption = (page: Page, name: string) =>
  expect(getOption(page, name)).toHaveAttribute("data-active-item", "");

const expectSelectedOption = (page: Page, name: string) =>
  expect(getOption(page, name)).toHaveAttribute("aria-selected", "true");

const createTransition = (duration = 100) => {
  const then = performance.now();
  const isPending = () => {
    const now = performance.now();
    return now - then < duration;
  };
  return isPending;
};

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/select-animated");
});

test("show/hide", async ({ page }) => {
  await expect(getPopover(page)).not.toBeVisible();
  await getButton(page).click();
  await expect(getPopover(page)).toBeVisible();
  await expect(getPopover(page)).toBeFocused();
  await expectSelectedOption(page, "Apple");
  await expectActiveOption(page, "Apple");
  const isLeaving = createTransition();
  await page.keyboard.press("Escape");
  await expect(getButton(page)).toBeFocused();
  if (isLeaving()) {
    await expect(getPopover(page)).toBeVisible();
  }
  await expect(getPopover(page)).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(getPopover(page)).toBeFocused();
  await expectSelectedOption(page, "Apple");
  await expectActiveOption(page, "Apple");
  await page.keyboard.press("ArrowDown");
  await expectSelectedOption(page, "Apple");
  await expectActiveOption(page, "Banana");
  await page.keyboard.press("Enter");
  await expect(getPopover(page)).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(getPopover(page)).toBeFocused();
  await expectSelectedOption(page, "Banana");
  await expectActiveOption(page, "Banana");
});

test("do not scroll when opening the select popover", async ({ page }) => {
  await getButton(page).focus();
  await page.evaluate(() => window.scrollTo({ top: 100 }));
  await page.keyboard.press("Enter");
  await expect(getPopover(page)).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(100);
});

test("https://github.com/ariakit/ariakit/issues/1684", async ({ page }) => {
  await getButton(page).focus();
  await page.keyboard.press("Enter");
  await page.mouse.click(1, 1);
  await expect(getPopover(page)).not.toBeVisible();
});
