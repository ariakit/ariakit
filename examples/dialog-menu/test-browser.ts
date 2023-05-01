import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name });

const getDialog = (page: Page) =>
  page.getByRole("dialog", { name: "Homemade Cake" });

const getBackdrop = async (page: Page) => getDialog(page).locator("xpath=..");

const getMenu = (page: Page) => page.getByRole("menu", { name: "Share" });

const getMenuItem = (page: Page, name: string) =>
  page.getByRole("menuitem", { name });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-menu", { waitUntil: "networkidle" });
});

test("dragging the cursor to outside the dialog", async ({ page }) => {
  await getButton(page, "View recipe").click();
  await expect(getDialog(page)).toBeVisible();
  await getDialog(page).dragTo(await getBackdrop(page), {
    targetPosition: { x: 0, y: 0 },
  });
  await expect(getDialog(page)).toBeVisible();
});

test("dragging the cursor to outside the menu", async ({ page }) => {
  await getButton(page, "View recipe").click();
  await getButton(page, "Share").click();
  await expect(getDialog(page)).toBeVisible();
  await expect(getMenu(page)).toBeVisible();
  await getMenuItem(page, "Facebook").dragTo(getDialog(page));
  await expect(getDialog(page)).toBeVisible();
  await expect(getMenu(page)).toBeVisible();
});

test("dragging the cursor to outside both", async ({ page }) => {
  await getButton(page, "View recipe").click();
  await getButton(page, "Share").click();
  await expect(getDialog(page)).toBeVisible();
  await expect(getMenu(page)).toBeVisible();
  await getMenuItem(page, "Facebook").dragTo(await getBackdrop(page), {
    targetPosition: { x: 0, y: 0 },
  });
  await expect(getDialog(page)).toBeVisible();
  await expect(getMenu(page)).toBeVisible();
});
