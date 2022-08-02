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

const createTransition = (duration = 100) => {
  const then = performance.now();
  const isPending = () => {
    const now = performance.now();
    return now - then < duration;
  };
  return isPending;
};

test("show/hide", async ({ page }) => {
  await page.goto("/examples/select-animated");
  await expect(getPopover(page)).not.toBeVisible();
  const isEntering = createTransition();
  await getButton(page).click();
  await expect(getPopover(page)).toBeVisible();
  if (isEntering()) {
    await expect(getButton(page)).toBeFocused();
  }
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

test("https://github.com/ariakit/ariakit/issues/1684", async ({ page }) => {
  await page.goto("/examples/select-animated");
  await getButton(page).focus();
  await page.keyboard.down("Shift");
  await page.keyboard.down("Enter");
  await page.keyboard.down("Tab");
  await page.keyboard.up("Enter");
  await page.keyboard.up("Tab");
  await page.keyboard.up("Shift");
  await expect(getPopover(page)).not.toBeVisible();
});
