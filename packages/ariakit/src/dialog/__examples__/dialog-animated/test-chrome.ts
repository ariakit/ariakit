import { Page, expect, test } from "@playwright/test";

const getDialog = (page: Page) => page.locator("role=dialog[name='Apples']");
const getButton = (page: Page, name: string) =>
  page.locator(`role=button[name='${name}']`);

test("show/hide", async ({ page }) => {
  await page.goto("/examples/dialog-animated");
  await getButton(page, "View details").click();
  await expect(getDialog(page)).toBeVisible();
  // Wait for animation before focusing inside dialog
  await expect(getButton(page, "Dismiss popup")).not.toBeFocused();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await page.locator("role=button[name='Dismiss popup']").click();
  // Wait for animation before hiding the dialog
  await expect(getDialog(page)).toBeVisible();
  await expect(getDialog(page)).not.toBeVisible();
});
