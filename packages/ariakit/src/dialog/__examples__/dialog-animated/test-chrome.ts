import { expect, test } from "@playwright/test";

test("show/hide on disclosure click", async ({ page }) => {
  await page.goto("/examples/dialog-animated");
  await page.locator("role=button[name='View details']").click();
  await expect(page.locator("role=dialog[name='Apples']")).toBeVisible();
  await page.locator("role=button[name='Dismiss popup']").click();
  await expect(page.locator("role=dialog[name='Apples']")).not.toBeVisible();
});


