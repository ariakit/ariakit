import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

test("tooltip does not appear on mobile click", async ({ page }) => {
  await expect(page.getByRole("tooltip", { name: "Bold" })).not.toBeVisible();
  await page.getByRole("button").tap();
  await page.waitForTimeout(600);
  await expect(page.getByRole("tooltip", { name: "Bold" })).not.toBeVisible();
});
