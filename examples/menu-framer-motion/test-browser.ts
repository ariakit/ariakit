import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getMenuButton = (page: Page) =>
  page.getByRole("button", { name: "Options" });

const getMenu = (page: Page) => page.getByRole("menu");

const getMenuItem = (page: Page, name: string) =>
  page.getByRole("menuitem", { name });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/menu-framer-motion", { waitUntil: "networkidle" });
});

test("open/hide with click", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 480 });
  await expect(getMenu(page)).not.toBeVisible();
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  await expect(getMenu(page)).toBeFocused();
  await getMenuItem(page, "Report").click();
  await expect(getMenu(page)).not.toBeVisible();
  await expect(getMenuButton(page)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getMenuItem(page, "Edit")).toBeFocused();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Enter");
  await expect(getMenuItem(page, "Edit")).toBeFocused();
});
