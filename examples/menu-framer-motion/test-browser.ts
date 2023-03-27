import { Page, expect, test } from "@playwright/test";

const getMenuButton = (page: Page) =>
  page.getByRole("button", { name: "Options" });

const getMenu = (page: Page) => page.getByRole("menu");

const getMenuItem = (page: Page, name: string) =>
  page.getByRole("menuitem", { name });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/menu-framer-motion");
  await page.waitForTimeout(150);
});

test("open/hide with click", async ({ page }, testInfo) => {
  testInfo.snapshotSuffix = "";
  const isMac = await page.evaluate(() => navigator.platform.startsWith("Mac"));
  await page.setViewportSize({ width: 480, height: 480 });
  await expect(getMenu(page)).not.toBeVisible();
  const menuButton = getMenuButton(page);
  await menuButton.click();
  await expect(getMenu(page)).toBeVisible();
  await expect(getMenu(page)).toBeFocused();
  if (isMac) {
    expect(await page.screenshot()).toMatchSnapshot();
  }
  await getMenuItem(page, "Report").click();
  await expect(getMenu(page)).not.toBeVisible();
  await expect(menuButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getMenuItem(page, "Edit")).toBeFocused();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Enter");
  await expect(getMenuItem(page, "Edit")).toBeFocused();
});
