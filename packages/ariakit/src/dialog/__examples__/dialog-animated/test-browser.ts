import { Page, expect, test } from "@playwright/test";

const getDialog = (page: Page) => page.locator("role=dialog[name='Apples']");
const getButton = (page: Page, name: string) =>
  page.locator(`role=button[name='${name}']`);

test("show/hide", async ({ page, headless }) => {
  await page.goto("/examples/dialog-animated");
  await expect(getDialog(page)).not.toBeVisible();
  await getButton(page, "View details").click();
  await expect(getDialog(page)).toBeVisible();
  if (headless) {
    await expect(getButton(page, "View details")).toBeFocused();
  }
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await getButton(page, "Dismiss popup").click();
  await expect(getDialog(page)).toBeVisible();
  if (headless) {
    await expect(getButton(page, "View details")).toBeFocused();
  }
  await expect(getDialog(page)).not.toBeVisible();
});
