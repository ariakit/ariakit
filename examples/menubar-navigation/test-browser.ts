import { expect, type Page, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

function pressTab(page: Page, browserName: string, shift = false) {
  const key = shift ? "Shift+Tab" : "Tab";
  if (browserName === "webkit") {
    return page.keyboard.press(`Alt+${key}`);
  }
  return page.keyboard.press(key);
}

test.describe.configure({ retries: 2 });

test("show menus by hovering over items without moving focus", async ({
  page,
}) => {
  const q = query(page);
  const body = page.locator("body");

  await q.menuitem("Services").hover();
  await expect(q.menu("Services")).toBeVisible();
  await expect(body).toBeFocused();

  await q.menuitem("Blog").hover();
  await expect(q.menu("Services")).not.toBeVisible();
  await expect(q.menu("Blog")).toBeVisible();
  await expect(body).toBeFocused();

  // hover outside
  await page.mouse.move(10, 10);
  await expect(q.menu("Blog")).not.toBeVisible();
  await expect(body).toBeFocused();

  await q.menuitem("Company").hover();
  await expect(q.menu("Company")).toBeVisible();
  await expect(body).toBeFocused();

  await q.menuitem("Contact").hover();
  await expect(q.menu("Company")).not.toBeVisible();
  await expect(body).toBeFocused();

  await q.menuitem("Blog").hover();
  await expect(q.menu("Blog")).toBeVisible();
  await expect(body).toBeFocused();
});

test("show menus by hovering over items and subitems", async ({ page }) => {
  const q = query(page);
  await q.menuitem("Services").hover();
  await q.menuitem("Web Development").hover();
  await expect(q.menu("Services")).not.toBeFocused();

  await q.menuitem("Company").hover();
  await q.menuitem("Company").hover({ position: { x: 10, y: 10 } });
  await expect(q.menuitem("Company")).not.toBeFocused();
  await expect(q.menu("Services")).not.toBeVisible();
  await expect(q.menu("Company")).toBeVisible();

  // hover outside
  await page.mouse.move(10, 10);
  await page.waitForTimeout(750);
  await expect(q.menu("Company")).not.toBeVisible();
});

test("show menus by focusing on items", async ({ page, browserName }) => {
  const q = query(page);
  await pressTab(page, browserName);
  await expect(q.menuitem("Services")).toBeFocused();
  await expect(q.menu("Services")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(q.menuitem("Blog")).toBeFocused();
  await expect(q.menu("Blog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(q.menuitem("Company")).toBeFocused();
  await expect(q.menu("Blog")).not.toBeVisible();
  await expect(q.menu("Company")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(q.menuitem("Contact")).toBeFocused();
  await expect(q.menu("Company")).not.toBeVisible();
});

test("show menus by tabbing through items", async ({ page, browserName }) => {
  const q = query(page);
  await pressTab(page, browserName);
  await expect(q.menuitem("Services")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("Web Development")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("Mobile Development")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("Blog")).toBeFocused();
  await expect(q.menu("Blog")).toBeVisible();
  await pressTab(page, browserName);
  await expect(q.menuitem("Tech")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("Business")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("Archives")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("Company")).toBeFocused();
  await expect(q.menu("Blog")).not.toBeVisible();
  await expect(q.menu("Company")).toBeVisible();
  await pressTab(page, browserName);
  await expect(q.menuitem("About Us")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("HR")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("Finance")).toBeFocused();
  await pressTab(page, browserName);
  await expect(q.menuitem("Contact")).toBeFocused();
  await expect(q.menu("Company")).not.toBeVisible();
  await pressTab(page, browserName, true);
  await expect(q.menuitem("Company")).toBeFocused();
  await expect(q.menu("Company")).toBeVisible();
  await pressTab(page, browserName, true);
  await expect(q.menuitem("Blog")).toBeFocused();
  await expect(q.menu("Company")).not.toBeVisible();
  await expect(q.menu("Blog")).toBeVisible();
  await pressTab(page, browserName);
  await expect(q.menuitem("Tech")).toBeFocused();
  await pressTab(page, browserName, true);
  await expect(q.menuitem("Blog")).toBeFocused();
  await expect(q.menu("Blog")).toBeVisible();
  await pressTab(page, browserName, true);
  await expect(q.menuitem("Services")).toBeFocused();
  await expect(q.menu("Blog")).not.toBeVisible();
  await expect(q.menu("Services")).toBeVisible();
});

test("moving between menus with arrow keys after hovering over subitems", async ({
  page,
}) => {
  const q = query(page);
  await q.menuitem("Blog").hover();
  await q.menuitem("Tech").hover();
  await page.keyboard.press("ArrowRight");
  await expect(q.menu("Blog")).toBeVisible();
  await expect(q.menu("Company")).not.toBeVisible();
  await expect(q.menuitem("Company")).not.toBeFocused();
});

test("click on menuitem links", async ({ page, browserName }) => {
  const q = query(page);

  await q.menuitem("Services").hover();
  await expect(q.menu("Services")).toBeVisible();
  await q.menuitem("Services").click();
  await page.waitForURL(/#\/services$/);
  await expect(q.menu("Services")).toBeVisible();

  await q.menuitem("Contact").click();
  await q.menuitem("Contact").focus();
  await page.waitForURL(/#\/contact$/);
  await expect(q.menu("Services")).not.toBeVisible();

  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");

  await page.waitForURL(/#\/services$/);
  await expect(q.menu("Services")).toBeVisible();

  if (browserName !== "firefox") {
    await expect(q.menuitem("Web Development")).toBeFocused();
  }

  await page.keyboard.press("Escape");
  await expect(q.menu("Services")).not.toBeVisible();
  await expect(q.menuitem("Services")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(q.menu("Services")).not.toBeVisible();
  await expect(q.menuitem("Services")).toBeFocused();
});

test("moving between menu items with arrow keys", async ({ page }) => {
  const q = query(page);

  await q.menuitem("Blog").click();
  await expect(q.menu("Blog")).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await expect(q.menuitem("Tech")).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(q.menuitem("Business")).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(q.menuitem("Archives")).toBeFocused();
});
