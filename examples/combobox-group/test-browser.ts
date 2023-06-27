import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getCombobox = (page: Page) => page.getByRole("combobox");
const getPopover = (page: Page) => page.getByRole("listbox");

function getSelectionValue(page: Page) {
  return getCombobox(page).evaluate((element) => {
    const input = element as HTMLInputElement;
    const { selectionStart, selectionEnd } = input;
    const selectionValue = input.value.slice(selectionStart!, selectionEnd!);
    return selectionValue;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-group", { waitUntil: "networkidle" });
});

test("maintain completion string while typing", async ({ page }) => {
  await getCombobox(page).click();
  await page.keyboard.type("av");
  await expect(getCombobox(page)).toHaveValue("avocado");
  expect(await getSelectionValue(page)).toBe("ocado");
  await page.keyboard.type("o");
  await expect(getCombobox(page)).toHaveValue("avocado");
  expect(await getSelectionValue(page)).toBe("cado");
  await page.keyboard.type("ca");
  await expect(getCombobox(page)).toHaveValue("avocado");
  expect(await getSelectionValue(page)).toBe("do");
});

test("do not scroll when hovering over an item", async ({ page }) => {
  await getCombobox(page).click();
  await getPopover(page).click({ position: { x: 2, y: 2 } });
  await getPopover(page).evaluate((el) => (el.scrollTop = 100));
  expect(await getPopover(page).evaluate((el) => el.scrollTop)).toBe(100);
  await getPopover(page).hover({ position: { x: 40, y: 10 } });
  expect(await getPopover(page).evaluate((el) => el.scrollTop)).toBe(100);
});
