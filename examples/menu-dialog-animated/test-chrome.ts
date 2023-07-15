import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getMenuButton = (locator: Page | Locator, count: number | string = "") =>
  locator.getByRole("button", {
    name: count !== "" ? `Add to list ${count}` : /^Add to list/,
  });

const getMenu = (locator: Page | Locator) =>
  locator.getByRole("menu", { name: "Lists" });

const getMenuItem = (
  locator: Page | Locator,
  name: string,
  role = "menuitem",
) => locator.locator(`role=${role}[name='${name}']`);

const getMenuItemCheckbox = (locator: Page | Locator, name: string) =>
  getMenuItem(locator, name, "menuitemcheckbox");

const getDialog = (locator: Page | Locator, name: string) =>
  locator.getByRole("dialog", { name });

const getButton = (locator: Page | Locator, name: string) =>
  locator.getByRole("button", { name });

const getTextbox = (locator: Page | Locator) =>
  locator.getByRole("textbox", { name: "List name" });

const getError = (locator: Page | Locator) => locator.getByText("Please fill");

const repeat = async (fn: () => unknown, count: number) => {
  await [...new Array(count)].reduce((p) => p.then(fn), Promise.resolve());
};

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/menu-dialog-animated", {
    waitUntil: "networkidle",
  });
});

test("interact with menu", async ({ page }) => {
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
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
  await getMenuButton(page).press("Enter");
  await expect(getMenu(page)).toBeVisible();
  await expect(getMenuItem(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.type("cr");
  await expect(getMenuItem(page, "Create list")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getMenu(page)).not.toBeVisible();
  await expect(getDialog(page, "Create list")).toBeVisible();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getMenuButton(page)).toBeFocused();
  await expect(getDialog(page, "Create list")).not.toBeVisible();
});

test("create list", async ({ page }) => {
  await getMenuButton(page, 1).click();
  await expect(getMenu(page)).toBeVisible();
  await expect(getMenu(page)).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect(getMenuItem(page, "Create list")).toBeFocused();
  await getMenuItem(page, "Create list").click();
  await getTextbox(page).click();
  await page.keyboard.press("Enter");
  // Wait for the submission to complete.
  await expect(getButton(page, "Create")).not.toHaveAttribute(
    "aria-disabled",
    "true",
  );
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
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  await getMenuItem(page, "Create list").click();
  await getButton(page, "Manage lists").click();
  await expect(getDialog(page, "Manage lists")).toBeVisible();
  await expect(
    getButton(getDialog(page, "Manage lists"), "Dismiss popup"),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getButton(page, "Manage lists")).toBeFocused();
});

test("show/hide information dialog", async ({ page }) => {
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  await getMenuItem(page, "Create list").click();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await getButton(page, "More information").click();
  await expect(getDialog(page, "More information")).toBeVisible();
  await expect(
    getButton(getDialog(page, "More information"), "Dismiss popup"),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getButton(page, "More information")).toBeFocused();
});

test("repeatedly showing/hiding manage lists dialog", async ({ page }) => {
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  await getMenuItem(page, "Create list").click();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await repeat(async () => {
    await expect(getButton(page, "Manage lists")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(getDialog(page, "Manage lists")).toBeVisible();
    await expect(
      getButton(getDialog(page, "Manage lists"), "Dismiss popup"),
    ).toBeFocused();
    await page.keyboard.press("Enter");
  }, 10);
});

test("repeatedly showing/hiding information dialog", async ({ page }) => {
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  await getMenuItem(page, "Create list").click();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await repeat(async () => {
    await expect(getButton(page, "More information")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(getDialog(page, "More information")).toBeVisible();
    await expect(
      getButton(getDialog(page, "More information"), "Dismiss popup"),
    ).toBeFocused();
    await page.keyboard.press("Enter");
  }, 10);
});
