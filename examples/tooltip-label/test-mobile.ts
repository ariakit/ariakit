import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/tooltip-label", { waitUntil: "networkidle" });
});

test("tooltip does not appear on mobile click", async ({ page }) => {
  await expect(
    page.getByRole("presentation", { name: "Bold" }),
  ).not.toBeVisible();
  await page.getByRole("button").tap();
  await page.waitForTimeout(600);
  await expect(
    page.getByRole("presentation", { name: "Bold" }),
  ).not.toBeVisible();
});
