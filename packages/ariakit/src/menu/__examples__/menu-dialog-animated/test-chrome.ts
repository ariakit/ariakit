import { Locator, Page, expect, test } from "@playwright/test";

const getMenuButton = (locator: Page | Locator, count: number | string = "") =>
  locator.locator(`role=button[name^='Add to list ${count}']`);

const getMenu = (locator: Page | Locator) =>
  locator.locator(`role=menu[name^='Add to list']`);

const getMenuItem = (
  locator: Page | Locator,
  name: string,
  role = "menuitem"
) => locator.locator(`role=${role}[name='${name}']`);

const getMenuItemCheckbox = (locator: Page | Locator, name: string) =>
  getMenuItem(locator, name, "menuitemcheckbox");

const getDialog = (locator: Page | Locator, name: string) =>
  locator.locator(`role=dialog[name='${name}']`);

const getButton = (locator: Page | Locator, name: string) =>
  locator.locator(`role=button[name='${name}']`);

const getTextbox = (locator: Page | Locator) =>
  locator.locator(`role=textbox[name='List name']`);

const getError = (locator: Page | Locator) =>
  locator.locator("text=Please fill");

test("interact with menu", async ({ page, headless }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  if (headless) {
    await expect(getMenuButton(page)).toBeFocused();
  }
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

test("open/close create list dialog", async ({ page, headless }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).press("Enter");
  await expect(getMenuItem(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.type("cr");
  await expect(getMenuItem(page, "Create list")).toBeFocused();
  await page.keyboard.press("Enter");
  if (headless) {
    await expect(getMenuButton(page)).toBeFocused();
  }
  await expect(getMenu(page)).not.toBeVisible();
  await expect(getDialog(page, "Create list")).toBeVisible();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getMenuButton(page)).toBeFocused();
  await expect(getDialog(page, "Create list")).not.toBeVisible();
});

test("create list", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page, 1).click();
  await expect(getMenu(page)).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect(getMenuItem(page, "Create list")).toBeFocused();
  await getMenuItem(page, "Create list").click();
  await getTextbox(page).click();
  await page.keyboard.press("Enter");
  await expect(getError(page)).toBeVisible();
  await page.keyboard.type("F");
  await expect(getError(page)).not.toBeVisible();
  await page.keyboard.type("avorites");
  await page.keyboard.press("Enter");
  await expect(getDialog(page, "Create list")).not.toBeVisible();
  await expect(getMenu(page)).toBeVisible();
  await expect(getMenuItemCheckbox(page, "Favorites")).toBeFocused();
  await expect(getMenuButton(page, 2)).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(getMenuButton(page, 1)).toBeVisible();
});

test("bug", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).click();
  await getMenuItem(page, "Create list").click();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(getButton(page, "Learn more about lists")).toBeFocused();
  await [...new Array(20)].reduce(
    (p) =>
      p
        .then(() => page.keyboard.press("Enter"))
        .then(() => expect(getDialog(page, "About lists")).toBeVisible())
        .then(() =>
          expect(
            getButton(getDialog(page, "About lists"), "Dismiss popup")
          ).toBeFocused()
        )
        .then(() => page.keyboard.press("Enter")),
    Promise.resolve()
  );
});
