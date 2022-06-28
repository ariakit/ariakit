import { Locator, Page, expect, test } from "@playwright/test";

const getMenuButton = (locator: Page | Locator) =>
  locator.locator(`role=button[name^='Add to list']`);

const getMenu = (locator: Page | Locator) =>
  locator.locator(`role=menu[name^='Add to list']`);

const getMenuItem = (
  locator: Page | Locator,
  name: string,
  role = "menuitem"
) => locator.locator(`role=${role}[name='${name}']`);

const getDialog = (locator: Page | Locator, name: string) =>
  locator.locator(`role=dialog[name='${name}']`);

const getButton = (locator: Page | Locator, name: string) =>
  locator.locator(`role=button[name='${name}']`);

test("interact with menu", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  await expect(getMenuButton(page)).toBeFocused();
  await expect(getMenu(page)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(getMenuItem(page, "Create list")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(getMenu(page)).not.toBeFocused();
  await expect(getMenuButton(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(getMenu(page)).toBeFocused();
  await expect(getMenuButton(page)).not.toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(getMenuItem(page, "Dismiss popup")).toBeFocused();
});

test("open/close create list dialog", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).press("Enter");
  await expect(getMenuItem(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.type("cr");
  await expect(getMenuItem(page, "Create list")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getMenuButton(page)).toBeFocused();
  await expect(getMenu(page)).not.toBeVisible();
  await expect(getDialog(page, "Create list")).toBeVisible();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getMenuButton(page)).toBeFocused();
  await expect(getDialog(page, "Create list")).not.toBeVisible();
});
