import { expect, test } from "@playwright/test";
import { preview } from "../test-utils.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(preview("tooltip-label"), { waitUntil: "networkidle" });
});

test("tooltip does not appear on mobile click", async ({ page }) => {
  await expect(page.getByRole("tooltip", { name: "Bold" })).not.toBeVisible();
  await page.getByRole("button").tap();
  await page.waitForTimeout(600);
  await expect(page.getByRole("tooltip", { name: "Bold" })).not.toBeVisible();
});
