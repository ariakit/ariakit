import { expect, test } from "@playwright/test";

test("show on animated disclosure click", async ({ page }) => {
  await page.goto("/examples/dialog-animated");
  await page.locator("role=button[name='Open modal details']").click();
  await expect(page.locator("role=dialog[name='Dialog title']")).toBeVisible();
  await page.locator("role=button[name='Dismiss popup']").click();
  await expect(
    page.locator("role=dialog[name='Dialog title']")
  ).not.toBeVisible();
});

test("close disclosure by clicking hide button", async ({ page }) => {
  await page.goto("/examples/dialog-animated");
  await page.locator("role=button[name='Open modal details']").click();
  await expect(page.locator("role=dialog[name='Dialog title']")).toBeVisible();
  await page.locator("role=button[name='Submit']").click();
  await expect(
    page.locator("role=dialog[name='Dialog title']")
  ).not.toBeVisible();
});
