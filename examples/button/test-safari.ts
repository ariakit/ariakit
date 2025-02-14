import { expect, test } from "@playwright/test";
import { preview } from "../test-utils.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(preview("button"), { waitUntil: "networkidle" });
});

test("button receives focus on click", async ({ page }) => {
  const button = page.getByRole("button", { name: "Button" });
  await button.click();
  await expect(button).toBeFocused();
});
