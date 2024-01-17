import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-menu", { waitUntil: "networkidle" });
});

test("menu closes when tapping dialog", async ({ page }) => {
  await page.getByRole("button", { name: "View recipe" }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Share" }).tap();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.getByRole("dialog").tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("menu")).not.toBeVisible();
});

test("menu closes when tapping outside", async ({ page }) => {
  await page.getByRole("button", { name: "View recipe" }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Share" }).tap();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.touchscreen.tap(10, 10);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("menu")).not.toBeVisible();
});
