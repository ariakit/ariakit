import { Locator, Page, expect, test } from "@playwright/test";

const getMenuButton = (locator: Page | Locator, count: number | string = "") =>
  locator.locator(`role=button[name^='Add to list ${count}']`);

const getMenu = (locator: Page | Locator) =>
  locator.locator(`role=menu[name='Lists']`);

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

const repeat = async (fn: () => unknown, count: number) => {
  await [...new Array(count)].reduce((p) => p.then(fn), Promise.resolve());
};

const createTransition = (duration = 100) => {
  const then = performance.now();
  const isPending = () => {
    const now = performance.now();
    return now - then < duration;
  };
  return isPending;
};

test("interact with menu", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await expect(getMenu(page)).not.toBeVisible();
  const isEntering = createTransition();
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  if (isEntering()) {
    // The menu button should be focused while the menu is animating.
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

test("show/hide create list dialog", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).press("Enter");
  await expect(getMenuItem(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.type("cr");
  await expect(getMenuItem(page, "Create list")).toBeFocused();
  const isEntering = createTransition();
  await page.keyboard.press("Enter");
  if (isEntering()) {
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
  await expect(getTextbox(page)).toHaveValue("Favorites");
  await page.keyboard.press("Enter");
  await expect(getDialog(page, "Create list")).not.toBeVisible();
  await expect(getMenu(page)).toBeVisible();
  await expect(getMenuItemCheckbox(page, "Favorites")).toBeFocused();
  await expect(getMenuButton(page, 2)).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(getMenuButton(page, 1)).toBeVisible();
});

test("show/hide manage lists dialog", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).click();
  await getMenuItem(page, "Create list").click();
  const isEntering = createTransition();
  await getButton(page, "Manage lists").click();
  await expect(getDialog(page, "Manage lists")).toBeVisible();
  if (isEntering()) {
    await expect(getButton(page, "Manage lists")).toBeFocused();
  }
  await expect(
    getButton(getDialog(page, "Manage lists"), "Dismiss popup")
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getButton(page, "Manage lists")).toBeFocused();
});

test("show/hide information dialog", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).click();
  await getMenuItem(page, "Create list").click();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  const isEntering = createTransition();
  await page.keyboard.press("Enter");
  if (isEntering()) {
    await expect(getMenuButton(page)).toBeFocused();
  }
  await expect(getDialog(page, "More information")).toBeVisible();
  await expect(
    getButton(getDialog(page, "More information"), "Dismiss popup")
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getButton(page, "More information")).toBeFocused();
});

test("repeatedly showing/hiding manage lists dialog", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).click();
  await getMenuItem(page, "Create list").click();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(getButton(page, "Manage lists")).toBeFocused();
  await repeat(async () => {
    await page.keyboard.press("Enter");
    await expect(getDialog(page, "Manage lists")).toBeVisible();
    await expect(
      getButton(getDialog(page, "Manage lists"), "Dismiss popup")
    ).toBeFocused();
    await page.keyboard.press("Enter");
  }, 10);
});

test("repeatedly showing/hiding information dialog", async ({ page }) => {
  await page.goto("/examples/menu-dialog-animated");
  await getMenuButton(page).click();
  await getMenuItem(page, "Create list").click();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(getButton(page, "More information")).toBeFocused();
  await repeat(async () => {
    await page.keyboard.press("Enter");
    await expect(getDialog(page, "More information")).toBeVisible();
    await expect(
      getButton(getDialog(page, "More information"), "Dismiss popup")
    ).toBeFocused();
    await page.keyboard.press("Enter");
  }, 10);
});
