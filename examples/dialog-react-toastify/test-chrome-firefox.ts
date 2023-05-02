import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page | Locator, name: string) =>
  page.getByRole("button", { name });

const getDialog = (page: Page | Locator, name: string) =>
  page.getByRole("dialog", { name });

const getNotifications = (page: Page | Locator) =>
  page.getByRole("alert").filter({ hasText: "Hello!" });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-react-toastify", {
    waitUntil: "networkidle",
  });
});

test("show notification", async ({ page }) => {
  await expect(getNotifications(page)).toHaveCount(0);
  await getButton(page, "Say Hello").click();
  await expect(getNotifications(page)).toHaveCount(1);
  await getButton(page, "Say Hello").click();
  await expect(getNotifications(page)).toHaveCount(2);
});

test("show notification with modal", async ({ page }) => {
  await expect(getNotifications(page)).toHaveCount(0);
  await getButton(page, "Say Hello").click();
  await expect(getNotifications(page)).toHaveCount(1);
  await getButton(page, "Show modal").click();
  const dialog = getDialog(page, "Notification");
  await expect(dialog).toBeVisible();
  await expect(getNotifications(page)).toHaveCount(1);
  await expect(getButton(dialog, "Say Hello")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(getButton(page, "close")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(getNotifications(page)).toHaveCount(0);
  await expect(getButton(page, "close")).not.toBeVisible();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(getButton(page, "Show modal")).toBeFocused();
});
