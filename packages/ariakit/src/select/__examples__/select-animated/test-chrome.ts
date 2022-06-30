import { Page, expect, test } from "@playwright/test";

const getButton = (page: Page) =>
  page.locator("role=combobox[name='Favorite fruit']");

const getPopover = (page: Page) =>
  page.locator(`role=listbox[name='Favorite fruit']`);

const getOption = (page: Page, name: string) =>
  page.locator(`role=option[name='${name}']`);

const expectActiveOption = (page: Page, name: string) =>
  expect(getOption(page, name)).toHaveAttribute("data-active-item", "");

const expectSelectedOption = (page: Page, name: string) =>
  expect(getOption(page, name)).toHaveAttribute("aria-selected", "true");

test("show/hide", async ({ page, headless }) => {
  await page.goto("/examples/select-animated");
  await expect(getPopover(page)).not.toBeVisible();
  await getButton(page).click();
  await expect(getPopover(page)).toBeVisible();
  if (headless) {
    await expect(getButton(page)).toBeFocused();
  }
  await expect(getPopover(page)).toBeFocused();
  await expectSelectedOption(page, "Apple");
  await expectActiveOption(page, "Apple");
  await page.keyboard.press("Escape");
  await expect(getButton(page)).toBeFocused();
  if (headless) {
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
