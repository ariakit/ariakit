import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getCombobox = (page: Page) => page.getByPlaceholder("e.g., Apple");
const getPopover = (page: Page) => page.getByRole("listbox");
const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name, exact: true });

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
  await page.keyboard.type("o");
  await expect(getCombobox(page)).toHaveValue("avocao");
  expect(await getSelectionValue(page)).toBe("");
  await expect(getOption(page, "Avocado")).toBeVisible();
  await expect(getOption(page, "Avocado")).toHaveAttribute(
    "data-active-item",
    "",
  );
});

test("do not scroll when hovering over an item", async ({ page }) => {
  await getCombobox(page).click();
  await getPopover(page).click({ position: { x: 2, y: 2 } });
  await getPopover(page).evaluate((el) => el.scrollTo({ top: 100 }));
  expect(await getPopover(page).evaluate((el) => el.scrollTop)).toBe(100);
  await getPopover(page).hover({ position: { x: 40, y: 10 } });
  expect(await getPopover(page).evaluate((el) => el.scrollTop)).toBe(100);
});

test("do not scroll when opening the popover by typing", async ({ page }) => {
  await page.evaluate(() => window.scrollTo({ top: 100 }));
  await page.keyboard.press("Tab");
  await page.keyboard.type("a");
  await expect(getPopover(page)).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(100);
});

test("set value on tab", async ({ page }) => {
  await page.evaluate(() => {
    const div = document.createElement("div");
    div.tabIndex = 0;
    document.body.append(div);
  });
  await page.keyboard.press("Tab");
  await expect(getCombobox(page)).toBeFocused();
  await page.keyboard.type("a");
  await expect(getPopover(page)).toBeVisible();
  await expect(getCombobox(page)).toHaveValue("apple");
  expect(await getSelectionValue(page)).toBe("pple");
  await page.keyboard.press("Tab");
  await expect(getCombobox(page)).not.toBeFocused();
  await expect(getPopover(page)).not.toBeVisible();
  await expect(getCombobox(page)).toHaveValue("apple");
});

test("set value on tab after moving to another item", async ({ page }) => {
  await page.evaluate(() => {
    const div = document.createElement("div");
    div.tabIndex = 0;
    document.body.append(div);
  });
  await getCombobox(page).click();
  await page.keyboard.type("ap");
  await expect(getCombobox(page)).toHaveValue("apple");
  expect(await getSelectionValue(page)).toBe("ple");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  expect(getCombobox(page)).toHaveValue("Papaya");
  await page.keyboard.press("Tab");
  await expect(getCombobox(page)).not.toBeFocused();
  await expect(getPopover(page)).not.toBeVisible();
  await expect(getCombobox(page)).toHaveValue("Papaya");
});

test("set value on click outside", async ({ page }) => {
  await getCombobox(page).click();
  await page.keyboard.type("co");
  await expect(getCombobox(page)).toHaveValue("coconut");
  expect(await getSelectionValue(page)).toBe("conut");
  await page.keyboard.press("ArrowDown");
  await expect(getCombobox(page)).toHaveValue("Avocado");
  await page.mouse.move(10, 10);
  await page.mouse.down();
  await expect(getCombobox(page)).toHaveValue("Avocado");
  await expect(getPopover(page)).toBeVisible();
  expect(await page.getByRole("option").all()).toHaveLength(1);
  await page.mouse.up();
  await expect(getPopover(page)).not.toBeVisible();
});
