import { expect, test } from "@playwright/test";

test("show on animated disclosure click", async ({ page }) => {
  await page.goto("/examples/dialog-animated");

  await page.locator("[aria-label='Open modal details']").click();

  await expect(await page.locator("[role='dialog']")).toBeVisible();

  await page.locator("[data-dialog-dismiss]").click();

  await expect(await page.locator("[role='dialog']")).not.toBeVisible();
});

test("close disclosure by clicking hide button", async ({ page }) => {
  await page.goto("/examples/dialog-animated");

  await page.locator("[aria-label='Open modal details']").click();

  await expect(await page.locator("[role='dialog']")).toBeVisible();

  await page.locator("[aria-label='Hide dialog']").click();

  await expect(await page.locator("[role='dialog']")).not.toBeVisible();
});
