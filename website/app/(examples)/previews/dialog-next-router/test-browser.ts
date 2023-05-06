import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getDialog = (page: Page) => page.getByRole("dialog", { name: "Login" });

const getLink = (page: Page) => page.getByRole("link", { name: "Login" });

const getInput = (page: Page, name: string) =>
  page.getByRole("textbox", { name });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-next-router", { waitUntil: "networkidle" });
});

test("show/hide", async ({ page }) => {
  // Open with click
  await getLink(page).click();
  await expect(page).toHaveURL(/router\/login$/);
  await expect(getDialog(page)).toBeVisible();
  await expect(getInput(page, "Email")).toBeFocused();
  // Close with Escape
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/router$/);
  await expect(getDialog(page)).not.toBeVisible();
  await expect(getLink(page)).toBeFocused();
  // Open with browser back
  await page.goBack();
  await expect(page).toHaveURL(/router\/login$/);
  await expect(getDialog(page)).toBeVisible();
  await expect(getInput(page, "Email")).toBeFocused();
  // Close by clicking outside
  await page.mouse.click(0, 0);
  await expect(page).toHaveURL(/router$/);
  await expect(getDialog(page)).not.toBeVisible();
  await expect(getLink(page)).toBeFocused();
  // Open by navigating to /login
  await page.goto("/previews/dialog-next-router/login");
  await expect(getDialog(page)).toBeVisible();
  await expect(getInput(page, "Email")).toBeFocused();
  // Close with browser back
  await page.goBack();
  await expect(page).toHaveURL(/router$/);
  await expect(getDialog(page)).not.toBeVisible();
  // Open with browser forward
  await page.goForward();
  await expect(page).toHaveURL(/router\/login$/);
  await expect(getDialog(page)).toBeVisible();
  await expect(getInput(page, "Email")).toBeFocused();
  // Refresh the page
  await page.reload();
  await expect(getDialog(page)).toBeVisible();
  await expect(getInput(page, "Email")).toBeFocused();
  // Close with form submit
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/router$/);
  await expect(getDialog(page)).not.toBeVisible();
  await expect(getLink(page)).toBeFocused();
});
